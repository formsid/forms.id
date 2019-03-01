<template lang="pug">
  .app-root
    router-view
    auth(:visible="authOpen")
    form-editor(:visible="formEditorOpen" :form="editingForm" v-if="feOpen")
</template>

<script>
import XLSX from 'xlsx'
import Auth from './components/Auth'
import NewFormEditor from './views/NewFormEditor'
import OrbitDB from 'orbit-db'
import { decryptECIES } from 'blockstack/lib/encryption'

export default {
  store: ['bus', 'collections', 'forms', 'user'],
  components: { Auth, 'form-editor' : NewFormEditor },
  data() {
    return {
      authOpen: true,
      formEditorOpen: false,
      feOpen: true,
      editingForm: null
    }
  },
  methods: {
    async connectIpfs(){
      return new Promise((resolve, reject) => {
        const repoPath = 'ipfs-formsid'
        let ipfs
        try {
          // Instatiate your IPFS node
          ipfs = new Ipfs({
            repo: repoPath,
            config: {
              Addresses: {
                Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star']
              }
            },
            EXPERIMENTAL: { pubsub: true, sharding: false, dht: false }
          })
        } catch(err) {
          console.log(err)
          reject()
        }
        ipfs.on('error', (e) => console.error(e))
        ipfs.on('ready', async () => {
          window.orbit = new OrbitDB(ipfs)
          resolve()
        })
      })
    },
    async fetchForms() {
      return new Promise(async (resolve, reject) => {
        let privateKey = blockstack.loadUserData().appPrivateKey
        this.forms = JSON.parse(await blockstack.getFile('forms.json', { decrypt : true }))
        let collections = []
        let newSubmissions = []
        this.forms.forEach(async f => {
          const file = JSON.parse(await blockstack.getFile(`forms/${f}.json`, { decrypt: true }))
          const subdb = await orbit.open(file.dbs.submissions)
          const viewdb = await orbit.open(file.dbs.views)
          await subdb.load()
          await viewdb.load()
          file.submissions = JSON.parse(await blockstack.getFile(`submissions/${f}.json`, { decrypt: true }))
          const allExtSubmissions = subdb.query(doc => doc)
          allExtSubmissions.forEach(extSub => {
            const decryptedSub = JSON.parse(decryptECIES(privateKey, extSub.data))
            decryptedSub._id = extSub._id
            if(file.submissions.map(s => s._id).indexOf(decryptedSub._id) == -1){
              newSubmissions.push(decryptedSub)
            }
          })
          if(newSubmissions.length){
            newSubmissions.forEach(async s => {
              this.user.notifications.push({ id: uuid('notification'), type: 'response', s: s._id, f: f, read: false, t: s.created })
              file.submissions.push(s)
            })
            await blockstack.putFile(`submissions/${f}.json`, JSON.stringify(file.submissions), { encrypt : true })
            await blockstack.putFile(`notifications.json`, JSON.stringify(this.user.notifications), { encrypt : true })
          }
          file.views = viewdb.value
          collections.push(file)
        })
        this.collections.forms = collections
        resolve()
      })
    },
    async updateForms() {
      return new Promise(async (resolve, reject) => {
        this.forms = JSON.parse(await blockstack.getFile('forms.json', { decrypt : true }))
        let collections = []
        let newSubmissions = []
        this.forms.forEach(async f => {
          const file = JSON.parse(await blockstack.getFile(`forms/${f}.json`, { decrypt: true }))
          const subdb = await orbit.open(file.dbs.submissions)
          const viewdb = await orbit.open(file.dbs.views)
          await subdb.load()
          await viewdb.load()
          file.submissions = JSON.parse(await blockstack.getFile(`submissions/${f}.json`, { decrypt: true }))
          const allExtSubmissions = subdb.query(doc => doc)
          allExtSubmissions.forEach(extSub => {
            if(file.submissions.map(s => s._id).indexOf(extSub._id) == -1){
              newSubmissions.push(extSub)
            }
          })
          if(newSubmissions.length){
            newSubmissions.forEach(async s => {
              this.user.notifications.push({ id: uuid('notification'), type: 'response', s: s._id, f: f, read: false, t: s.created })
              file.submissions.push(s)
            })
            await blockstack.putFile(`submissions/${f}.json`, JSON.stringify(file.submissions), { encrypt : true })
            await blockstack.putFile(`notifications.json`, JSON.stringify(this.user.notifications), { encrypt : true })
          }
          file.views = viewdb.value
          collections.push(file)
        })
        this.collections.forms = collections
        resolve()
      })
    },
    closeAuth(){
      this.connectIpfs().then(() => {
        this.fetchForms().then(() => {
          this.authOpen = false
        })
      })
    },
    closeFormEditor(){
      this.formEditorOpen = false
      this.editingForm = null
      // setTimeout(() => {
      //   this.feOpen = false
      //   setTimeout(() => {
      //     this.feOpen = true
      //   }, 500)
      // }, 500)
    },
    openFormEditor(form){
      this.editingForm = form
      this.formEditorOpen = true
    },
    signIn() {
      const origin = window.location.origin
      const date = new Date()
      date.setHours(date.getHours() + 1)
      const authRequest = blockstack.makeAuthRequest(
        blockstack.generateAndStoreTransitKey(),
        `${origin}`,
        `${origin}/manifest.json`,
        ['store_write', 'publish_data'],
        origin,
        date,
        { solicitGaiaHubUrl: true }
      )
      blockstack.redirectToSignInWithAuthRequest(authRequest)
    },
    exportData(form){
      const answerable = form.objects.filter(o => o.data.type !== 'image')
      let data = []
      form.submissions.forEach(s => {
        let record = {}
        answerable.map(a => a.id).forEach(object => {
          record[form.objects.find(o => o.id == object).data.title] = s.data[object]
        })
        data.push(record)
      })
      const ws = XLSX.utils.json_to_sheet(data, { header: answerable.map(a => a.data.title) })
			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, "Responses")
			XLSX.writeFile(wb, `${form.title}.xlsx`)
    },
  },
  mounted(){
    this.bus.$on('closeauth', this.closeAuth)
    this.bus.$on('closeformeditor', this.closeFormEditor)
    this.bus.$on('openformeditor', form => {
       this.openFormEditor(this.collections.forms.find(f => f.id == form))
    })
    this.bus.$on('exportdata', form => {
       this.exportData(this.collections.forms.find(f => f.id == form))
    })
    this.bus.$on('signin', this.signIn)
    this.bus.$on('fetchforms', this.fetchForms)
    this.bus.$on('updateforms', this.updateForms)
  },
  watch: {
    // $route(newValue, oldValue) {
    //   if(newValue.name == 'Form' || newValue.name == 'Dashboard'){
    //     this.updateForms()
    //   }
    // }
  },
}
</script>

<style>
@tailwind preflight;
@tailwind components;
.form-switch {
  @apply relative select-none w-12 leading-normal;
}
.form-switch-checkbox {
  @apply hidden;
}
.form-switch-label {
  @apply block overflow-hidden cursor-pointer bg-formsid-pale border rounded-full h-7 shadow-inner;
  transition: background-color 0.2s ease-in;
}
.form-switch-label:before {
  @apply absolute block bg-white pin-y w-7 border rounded-full -ml-1;
  right: 50%;
  content: "";
  transition: all 0.2s ease-in;
}
.form-switch-checkbox:checked+.form-switch-label,
.form-switch-checkbox:checked+.form-switch-label:before {}
.form-switch-checkbox:checked+.form-switch-label {
  @apply bg-formsid-glass shadow-none;
}
.form-switch-checkbox:checked+.form-switch-label:before {
  @apply pin-r;
}
@tailwind utilities;

@font-face {
  font-family: fair;
  src: url(/fonts/playfairdisplay-regular-webfont.woff);
}

@font-face {
  font-family: greycliff;
  src: url(/fonts/greycliff-cf-regular.woff2);
}

.fair {
  font-family: fair;
}

.greycliff {
  font-family: greycliff;
}

.subtle {
  transition: all .21s ease;
}
.not-so-subtle {
  transition: all 2.8s ease;
}

.vue-notification {
  padding: 10px;
  margin: 10px 5px 5px;
  font-size: 14px !important;
  color: rgba(48, 70, 152, .82) !important;
  background: rgba(48, 70, 152, .22) !important;
  border-left: 5px solid rgba(48, 70, 152, .82) !important;
  border-radius: 8px;
}
.el-collapse-item__arrow {
  display: none !important;
}
</style>

<style>
.main-navbar .navbar .notifications .dropdown-menu {
  min-width: 20rem !important;
  max-height: 16rem !important;
  overflow-y: scroll !important;
}

</style>


<style lang="css">
.el-collapse-item__content {
  padding: 0 1.2rem 25px;
  font-weight: 300;
}
.el-collapse-item__header {
  padding-left: 1.4rem;
  font-weight: 300 !important;
  height: 48px !important;
  color: inherit !important;
  font-size: inherit !important;
  background: inherit !important;
  overflow: hidden;
  display: block !important;
}
  .ti-tags {
    flex-direction: column;
  }
  .ti-content {
    overflow: hidden;
    margin-right: 4px;
  }
  .vue-tags-input ::placeholder {
    color: rgba(0,0,0,.7) !important;
  }
  .vue-tags-input {
    background-color: transparent !important;
    max-width: 100% !important;
  }

  .vue-tags-input .ti-new-tag-input {
    background: transparent;
    color: #868e96 !important;
    font-size: .86rem !important;
  }

  .vue-tags-input .ti-input {
    transition: border-bottom 200ms ease;
    border: none !important;
    padding: 0px !important;
  }

  /* we cange the border color if the user focuses the input */
  .vue-tags-input.ti-focus .ti-input {
    border: none !important;
  }

  /* default styles for all the tags */
  .vue-tags-input .ti-tag, .ti-new-tag-input-wrapper {
    position: relative;
    padding: .5625rem 1rem !important;
    font-size: 14px !important;
    background-color: rgba(48, 70, 152, .22) !important;
    margin-bottom: .65rem !important;
    border-radius: .38rem !important;
    border: 1px solid rgba(48, 70, 152, .42) !important;
    color: rgba(48, 70, 152, .82) !important;
    justify-content: space-between !important;
  }

  .vue-tags-input .ti-new-tag-input {
    color: rgba(48, 70, 152, .82) !important;
  }

  /* .ti-new-tag-input-wrapper {
    padding: .5625rem 1rem !important;
    background-color: rgba(48, 70, 152, .22) !important;
    font-size: 14px !important;
    border: 1px solid rgba(48, 70, 152, .42) !important;
    border-radius: .38rem !important;
    color: rgba(48, 70, 152, .82) !important;
  } */

  /* we defined a custom css class in the data model, now we are using it to style the tag */
  .vue-tags-input .ti-tag.custom-class {
    background: transparent;
    border: 1px solid #ebde6e;
    color: #ebde6e;
    margin-right: 4px;
    border-radius: 0px;
    font-size: 13px;
  }

  /* the styles if a tag is invalid */
  .vue-tags-input .ti-tag.ti-invalid {
    background-color: #e88a74;
  }

  /* if the user input is invalid, the input color should be red */
  .vue-tags-input .ti-new-tag-input.ti-invalid {
    color: #e88a74;
  }

  /* if a tag or the user input is a duplicate, it should be crossed out */
  .vue-tags-input .ti-duplicate span,
  .vue-tags-input .ti-new-tag-input.ti-duplicate {
    text-decoration: line-through;
  }

  /* if the user presses backspace, the complete tag should be crossed out, to mark it for deletion */
  .vue-tags-input .ti-tag:after {
    transition: transform .2s;
    position: absolute;
    content: '';
    height: 2px;
    width: 108%;
    left: -4%;
    top: calc(50% - 1px);
    background-color: #000;
    transform: scaleX(0);
  }

  .vue-tags-input .ti-deletion-mark:after {
    transform: scaleX(1);
  }
</style>
