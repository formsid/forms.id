<template lang="pug">
  .app-root
    router-view
    auth(:visible="authOpen")
    form-editor(:visible="formEditorOpen" :form="editingForm" v-if="feOpen")
    notifications(group="topcent" position="top center")
</template>

<script lang="coffee">
import XLSX from 'xlsx'
import Auth from './components/Auth'
import FormEditor from './components/FormEditor'
import OrbitDB from 'orbit-db'
import { decryptECIES } from 'blockstack/lib/encryption'

export default
  store: ['bus', 'collections', 'forms', 'user']
  components: { Auth, FormEditor }
  data: ->
    authOpen: true
    formEditorOpen: false
    feOpen: true
    editingForm: null
  methods:
    connectIpfs: ->
      new Promise (resolve, reject) =>
        try
          ipfs = new Ipfs
            config: Addresses: Swarm: [ '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star' ]
            EXPERIMENTAL: pubsub: true, ipnsPubsub: true
          ipfs.on('error', (e) => console.error(e))
          ipfs.on 'ready', () ->
            window.orbit = await OrbitDB.createInstance(ipfs)
            resolve()
        catch err
          reject(err)
    fetchForms: ->
      new Promise (resolve, reject) =>
        privateKey = @user.apk
        @forms = JSON.parse(await blockstack.getFile('forms.json', { decrypt : true }))
        collections = []
        newSubmissions = []
        @forms.forEach (f) =>
          file = JSON.parse(await blockstack.getFile("forms/#{f}.json", { decrypt: true }))
          subdb = await orbit.docstore(file.dbs.submissions)
          viewdb = await orbit.counter(file.dbs.views)
          await subdb.load()
          await viewdb.load()
          file.submissions = JSON.parse(await blockstack.getFile("submissions/#{f}.json", { decrypt: true }))
          allExtSubmissions = subdb.query (doc) => doc
          allExtSubmissions.forEach (extSub) =>
            isNewSubmission = (file.submissions.map (s) -> s._id).indexOf(extSub._id) is -1
            decryptedSub = JSON.parse decryptECIES privateKey, extSub.data
            decryptedSub._id = extSub._id
            newSubmissions.push decryptedSub if isNewSubmission
          if newSubmissions.length
            newSubmissions.forEach (s) =>
              @user.notifications.push({ id: uuid('notification'), type: 'response', s: s._id, f: f, read: false, t: s.created })
              file.submissions.push(s)
            await blockstack.putFile("submissions/#{f}.json", JSON.stringify(file.submissions), { encrypt : true })
            await blockstack.putFile("notifications.json", JSON.stringify(@user.notifications), { encrypt : true })
          file.views = viewdb.value
          collections.push(file)
        @collections.forms = collections
        resolve()
    closeAuth: ->
      @$router.push({ name: 'Forms' })
      await @connectIpfs()
      await @fetchForms()
      @authOpen = false
    closeFormEditor: ->
      @formEditorOpen = false
      @editingForm = null
    openFormEditor: (form) ->
      @editingForm = form
      @formEditorOpen = true
    exportData: (form) ->
      answerable = form.objects.filter (o) -> o.data.type.indexOf('image') is -1
      data = []
      form.submissions.forEach (s) =>
        record = {}
        answerable.forEach (object) =>
          record[object.data.title] = (s.data.find (a) -> a.id is object.id).answer
        data.push(record)
      ws = XLSX.utils.json_to_sheet(data, { header: answerable.map (a) -> a.data.title })
      wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Responses")
      XLSX.writeFile(wb, "#{form.title}.xlsx")
  mounted: ->
    @bus.$on('closeformeditor', @closeFormEditor)
    @bus.$on 'openformeditor', (formId) =>
      form = @collections.forms.find (f) => f.id is formId
      @openFormEditor(form)
    @bus.$on 'exportdata', (formId) =>
      form = @collections.forms.find (f) => f.id is formId
      @exportData(form)
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

.notifications {
  top: 15px !important;
  z-index: 9999999999999999999 !important;
}
.vue-notification {
  padding: 10px;
  margin: 10px 5px 5px;
  font-size: 14px !important;
  color: rgba(48, 70, 152, .82) !important;
  background: rgba(48, 70, 152, .22) !important;
  border: 1px solid transparent !important;
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
.tooltip .tooltip-inner {
  background: rgba(48, 70, 152, .22) !important;
  color: rgba(48, 70, 152, .82) !important;
  padding: 7px 14px;
  border-radius: .25rem;
  font-weight: 300;
}
.tooltip[x-placement^="top"] {
  margin-bottom: 10px;
}
.tooltip[x-placement^="bottom"] {
  margin-top: 10px;
}
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
