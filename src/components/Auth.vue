<template>
  <div class="min-h-screen w-full fixed pin z-max bg-formsid-glass not-so-subtle flex flex-col items-center justify-center px-8" :class="open">
    <!-- <img src="../assets/images/auth.svg" alt="" class="absolute pin-b pin-r"/> -->
    <img src="../assets/images/logo_white.svg" alt="" class="max-w-sm mb-16"/>
    <d-button class="btn-outline-white border-2 btn-lg font-light hover:text-formsid" @click="signIn()">
      Login w/ Blockstack
    </d-button>
  </div>
</template>

<script>
import { decryptECIES, encryptECIES } from 'blockstack/lib/encryption'
import crypto from 'simple-crypto-js'

export default {
  name: 'Auth',
  store: ['bus', 'user'],
  props: ['visible'],
  data() {
    return {

    }
  },
  computed: {
    open(){
      return this.visible ? 'opacity-100 visible' : 'opacity-0 invisible'
    }
  },
  methods: {
    signIn() {
      this.bus.$emit('signin')
    },
    async putUser(data){
      return new Promise(async (resolve, reject) => {
        this.user = {
          username : data.username ? data.username : data.profile.name
        }
        resolve()
      })
    },
    async checkUser(){
      if(!this.$route.query.authResponse){
        if(blockstack.isUserSignedIn()){
          const data = blockstack.loadUserData()
          await this.putUser(data)
          // await blockstack.putFile('forms.json', JSON.stringify([]), { encrypt : true })
          this.bus.$emit('closeauth')
        }
      }
      if(blockstack.isSignInPending()) {
        console.log('pending sign in')
        blockstack.handlePendingSignIn().then(async userData => {
          this.$router.push({ name: this.$route.name })
          this.userData = userData
          let file
          try {
            file = await blockstack.getFile('preferences.json', { decrypt: true })
            if(file === null || typeof(file.created) == 'undefined') throw 'new user; blockstack null'
            console.log('old user')
            this.bus.$emit('closeauth')
          } catch(err) {
            console.log('new user')
            const cleanArray = JSON.stringify([])
            const aesKey = crypto.generateRandom()
            const pubKey = blockstack.getPublicKeyFromPrivate(blockstack.loadUserData().appPrivateKey)
            const encryptedAesKey = encryptECIES(pubKey, aesKey)
            await blockstack.putFile('key.txt', pubKey, { encrypt : false })
            await blockstack.putFile('keycrypt.json', encryptedAesKey, { encrypt : false })
            await blockstack.putFile('forms.json', cleanArray, { encrypt : true })
            await blockstack.putFile('preferences.json', JSON.stringify({
              created: Date.now(),
              email: '',
              notifications: false
            }), { encrypt : true })
            this.bus.$emit('closeauth')
          }
        }).catch(err => {
          console.log(err)
          // error trying to authenticate

        })
      }
    },
  },
  created(){
    this.$nextTick(() => {
      this.checkUser()
    })
  }
}
</script>
