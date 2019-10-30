<template>
  <div class="min-h-screen w-full fixed pin z-max bg-formsid-glass not-so-subtle flex flex-col items-center justify-center px-8" :class="open">
    <!-- <img src="../assets/images/auth.svg" alt="" class="absolute pin-b pin-r"/> -->
    <img src="../assets/images/logo_white.svg" alt="" class="max-w-sm mb-16"/>
    <div class="cursor-pointer border-white border-2 p-4 text-white rounded text-xl font-light hover:bg-white  hover:text-formsid" @click="signIn()" v-if="!isLoggingIn">
      Login w/ Blockstack
    </div>
    <i class="fas fa-spinner fa-spin text-white text-6xl" v-if="isLoggingIn"></i>
  </div>
</template>

<script lang="coffee">
import { AppConfig, UserSession } from 'blockstack'
import { decryptECIES } from 'blockstack/lib/encryption'
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys'

export default
  name: 'Auth'
  store: ['bus', 'isDev', 'session', 'user']
  props: ['visible']
  data: ->
    isLoggingIn: false
  computed:
    open: ->
      'opacity-100 visible' if @visible
      'opacity-0 invisible' if !@visible
  methods:
    signIn: -> @session.redirectToSignIn()
    setUser: ->
      userData = @session.loadUserData()
      new Promise (resolve, reject) =>
        try
          pubkey = await @session.getFile 'key.txt', { decrypt : false }
        catch err
          pubkey = getPublicKeyFromPrivate(userData.appPrivateKey)
          await @session.putFile('key.txt', pubkey, { encrypt : false })
          await @session.putFile('forms.json', JSON.stringify([]), { encrypt : true })
        @user = {}
        @user.apk = userData.appPrivateKey
        @user.did = userData.decentralizedID
        @user.pk = pubkey
        @user.username = userData.username
        @user.avatar = userData.profile?.image[0]?.contentUrl || 'https://picsum.photos/100'
        resolve()
    checkUser: ->
      scopes = ['store_write']
      scopes = ['store_write', 'publish_data']
      confg = new AppConfig(scopes, window.location.origin, "/")
      @session = new UserSession({ appConfig: confg })
      if @session.isSignInPending()
        @isLoggingIn = true
        await @session.handlePendingSignIn()
        await @setUser()
        @$parent.closeAuth()
      @session.redirectToSignIn() unless @session.isUserSignedIn()
      if @session.isUserSignedIn()
        @isLoggingIn = true
        await @setUser()
        @$parent.closeAuth()
  created: ->
    @$nextTick => @checkUser()
</script>
