<template>
  <component :is="layout">
    <notifications group="topcent" :position="'top center'" />
    <router-view/>
    <auth :visible="authOpen"></auth>
  </component>
</template>

<script>
import Auth from './components/Auth'

export default {
  store: ['bus', 'collections', 'forms', 'user'],
  components: { Auth },
  data() {
    return {
      authOpen: true
    }
  },
  computed: {
    layout() {
      return `${this.$route.meta.layout || 'default'}-layout`;
    },
  },
  methods: {
    async fetchForms() {
      this.forms = JSON.parse(await blockstack.getFile('forms.json', { decrypt : true }))
      let collections = []
      this.forms.forEach(async f => {
        collections.push(JSON.parse(await blockstack.getFile(`forms/${f}.json`, { decrypt: true })))
      })
      this.collections.forms = collections
      this.collections.forms.forEach(f => {
        this.$gun.get(`${this.user.username}:${f.id}`).get('submissions').map().on((node, key) => {
          console.log(node)
          f.submissions.push(node)
          f.submissions = Array.from(new Set(f.submissions))
        })
      })
    },
    closeAuth(){
      this.authOpen = false
      this.fetchForms()
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
    }
  },
  mounted(){
    this.bus.$on('closeauth', this.closeAuth)
    this.bus.$on('signin', this.signIn)
    this.bus.$on('fetchforms', this.fetchForms)
  }
}
</script>

<style>
@tailwind preflight;
@tailwind components;
@tailwind utilities;

.cursor-pointer {
  cursor: pointer;
}

.subtle {
  transition: all .21s ease;
}
.not-so-subtle {
  transition: all 3.2s ease;
}
.modal {
  z-index: 99999999999 !important;
}
.vue-notification {
  padding: 10px;
  margin: 10px 5px 5px;

  font-size: 14px;

  color: rgba(48, 70, 152, .82);
  background: rgba(48, 70, 152, .22) !important;
  border-left: 5px solid rgba(48, 70, 152, .82) !important;
  border-radius: 8px;
}
</style>

<style lang="css">
  /* style the background and the text color of the input ... */

  .ti-tags {
    flex-direction: column;
  }
  .ti-content {
    overflow: hidden;
    margin-right: 4px;
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


  /* style the placeholders color across all browser */
  .vue-tags-input ::-webkit-input-placeholder {
    color: #a4b1b6;
  }

  .vue-tags-input ::-moz-placeholder {
    color: #a4b1b6;
  }

  .vue-tags-input :-ms-input-placeholder {
    color: #a4b1b6;
  }

  .vue-tags-input :-moz-placeholder {
    color: #a4b1b6;
  }

  /* default styles for all the tags */
  .vue-tags-input .ti-tag {
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
