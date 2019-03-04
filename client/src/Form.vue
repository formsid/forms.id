<template>
  <div class="min-h-screen overflow-hidden flex w-full">
    <div class="fixed h-full w-24 bg-formsid pin-l flex items-center justify-center">
      <a href="/" class="block no-underline">
        <img src="./assets/logomark.png" alt="Forms.id Logo" class="w-16 rounded-full">
      </a>
    </div>
    <div class="flex-grow min-h-screen ml-24 bg-blay text-formsid-darker flex flex-col items-center justify-center" v-if="isFetching">
      <i class="fas fa-spinner fa-spin text-formsid mb-8" style="font-size: 68px;"></i>
      <h1 class="font-light">Loading form...</h1>
    </div>
    <div class="relative flex-grow flex-col min-h-screen ml-24 bg-blay text-formsid-darker flex items-center justify-center" v-if="isSubmitted">
      <div class="container">
        <div class="md:px-16 max-w-md mx-auto pb-12">
          <div class="mx-auto pb-12">
            <h1 class="text-center fair mb-8 text-4xl">Thank you for your response.</h1>
            <div class="flex flex-col">
              <a class="no-underline block greycliff bg-formsid-clear hover:bg-formsid-glass hover:text-white rounded text-center p-4 max-w-xs mx-auto w-full mb-4 text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle" href="https://forms.id"> Create Your Own</a>
              <div class="greycliff bg-formsid-clear hover:bg-formsid-glass hover:text-white rounded text-center p-4 max-w-xs mx-auto w-full text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle"> Share Form</div>
            </div>
          </div>
        </div>
      </div>
      <footer class="absolute pin-b pin-l pin-r p-2 px-3 py-4">
        <div class="container fair">
          <div class="row flex justify-between">
            <ul class="flex list-reset items-center text-sm">
              <li>
                <a class="no-underline text-formsid mr-2" href="https://forms.id">Home</a>
              </li>
              <li>
                <a class="no-underline text-formsid mr-2" href="https://forms.id/about">About</a>
              </li>
              <li>
                <a class="no-underline text-formsid" href="https://forms.id/faq">FAQ</a>
              </li>
            </ul>
            <span class="text-sm text-formsid">&copy; Forms.id</span>
          </div>
        </div>
      </footer>
    </div>
    <div class="flex-grow min-h-screen ml-24 bg-blay text-formsid-darker flex flex-col items-center justify-center" v-if="isSubmitting">
      <i class="fas fa-spinner fa-spin text-formsid mb-8" style="font-size: 68px;"></i>
      <h1 class="font-light">Submitting your response...</h1>
    </div>
    <div class="flex-grow min-h-screen ml-24 bg-blay text-formsid-darker" id="content" v-if="shouldShowForm">
      <vue-scroll-progress-bar class="ml-24" @complete="handleComplete" height=".5rem" backgroundColor="rgba(48, 70, 152, .82)" containerColor="#CDD2E7"/>
      <div class="container h-full mt-15p">
        <div class="md:px-16 max-w-lg mx-auto pb-12">
          <div class="mx-auto pb-12">
            <h1 class="text-center fair mb-8 text-5xl text-formsid-darkest">{{ form.title }}</h1>
            <p class="greycliff max-w-lg mx-auto text-center text-xl leading-loose text-formsid-darker">{{ form.subtitle }}</p>
          </div>
          <div class="w-full mb-15p" v-if="form">
            <div class="mb-8" v-for="obj in form.objects" :key="obj.id">
              <p class="break-words greycliff max-w-lg mx-auto text-left text-xl leading-loose mb-2">{{ obj.data.title }}</p>
              <div class="flex items-center max-w-lg mx-auto py-2" v-if="['email', 'shortanswer'].indexOf(obj.data.type) > -1">
                <input @blur="setAnswer(obj.id.toString(), $event.target.value)" type="text" :aria-label="obj.data.title" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass">
              </div>
              <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'paragraph'">
                <textarea @blur="setAnswer(obj.id.toString(), $event.target.value)" aria-label="Full name" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-darker focus:text-formsid-glass resize-none" rows="3" v-autosize></textarea>
              </div>
              <div class="flex items-center max-w-lg mx-auto py-2" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1">
                <div class="flex flex-col w-full" v-if="obj.data.type.indexOf('multiple') > -1">
                  <div class="greycliff bg-formsid-clear hover:bg-formsid-glass hover:text-white rounded text-center p-3 text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle mb-4" v-for="choice in obj.data.choices" :key="choice.label" @click="setAnswer(obj.id.toString(), $event.target.innerText)" :class="{'bg-formsid-glass text-white' : answerIsSelected(choice.label, obj.id.toString()) }">{{ choice.label }}</div>
                </div>
                <select v-else class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass" @change="setAnswer(obj.id.toString(), $event.target.value)">
                  <option v-for="choice in obj.data.choices" :key="choice.label" :value="choice.value">{{ choice.label }}</option>
                </select>
              </div>
              <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'image'">
                <img class="w-full rounded" :src="obj.data.src"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed pin-b pin-l pin-r py-4 ml-24 bg-white flex items-center justify-between px-8 shadow-lg" v-if="shouldShowForm">
      <div class="flex-grow">

      </div>
      <div class="greycliff bg-formsid-clear hover:bg-formsid-glass hover:text-white rounded max-w-sm mx-auto text-center p-3 text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle w-32" @click="clickSubmit()"> Submit</div>
      </div>
  </div>
</template>

<script>
import { getFile } from 'blockstack'
import autosize from 'v-autosize'
import { encryptECIES } from 'blockstack/lib/encryption'
import OrbitDB from 'orbit-db'
const isDev = process.env.NODE_ENV == 'development'

export default {
  name: 'Form',
  directives: { autosize },
  data: () => {
    return {
      orbit: false,
      form: false,
      isFetching: true,
      isSubmitting: false,
      isSubmitted: false,
      answers: [],
      pubKey: ''
    }
  },
  computed: {
    emailsValid(){
      const emails = this.form.objects.filter(o => o.data.type == 'email')
      return emails.every(e => {
        const answer = this.answers.find(a => a.id == e.id)
        return answer
          ?  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer.answer)
          : true
      })
    },
    requiredsValid(){
      const required = this.form.objects.filter(o => o.required)
      return required.every(o => this.hasAnswer(o.id))
    },
    shouldShowForm(){
      return !this.isFetching && !this.isSubmitting && !this.isSubmitted
    }
  },
  methods: {
    async clickSubmit(){
      return new Promise(async (resolve, reject) => {
        this.isSubmitting = true
        if(this.validateForm()){
          const submission = {
            created: Date.now(),
            data: this.answers,
          }
          const encryptedSubmission = encryptECIES(this.pubKey, JSON.stringify(submission))
          const fslug = this.$route.params.fslug
          const uslug = this.$route.params.uslug
          const db = await this.orbit.open(this.form.dbs.submissions)
          const hash = await db.put({ _id: uuid('submission'), data : encryptedSubmission })
          this.isSubmitting = false
          this.isSubmitted = true
        } else {
          this.isSubmitting = false
        }
        resolve()
      })
    },
    hasAnswer(oid){
      const answer = this.answers.find(a => a.id == oid)
      return answer && answer !== ''
    },
    answerIsSelected(answer, oid){
      const object = this.form.objects.find(o => o.id == oid)
      const hasAnswer = this.answers.find(a => a.id == oid)
      return hasAnswer
        ? hasAnswer.answer == answer
        : false
    },
    async fetchForm(){
      return new Promise(async (resolve, reject) => {
        const options = {
          username: this.$route.params.uslug,
          app: `${isDev ? 'http://localhost:8080' : 'https://app.forms.id' }`,
          decrypt: false
        }
        const form = await getFile(`shared/${this.$route.params.fslug}.json`, options)
        const pubKey = await getFile(`key.txt`, options)
        this.form = JSON.parse(form)
        this.pubKey = pubKey
        resolve()
      })
    },
    handleComplete(){

    },
    validateForm(){
      return this.requiredsValid && this.emailsValid
    },
    setAnswer(id, answer){
      const object = this.form.objects.find(o => o.id == id)
      this.answers = this.answers.filter(a => a.id !== id)
      this.answers.push({ id: id, answer: answer })
    },
    async connectIpfs(){
      return new Promise(async (resolve, reject) => {
        const repoPath = 'ipfs-' + Math.random()
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
        }
        ipfs.on('error', (e) => console.error(e))
        ipfs.on('ready', async () => {
          this.orbit = new OrbitDB(ipfs)
          resolve()
        })
      })
    }
  },
  async mounted(){
    await this.connectIpfs()
    this.fetchForm().then(async () => {
      this.isFetching = false
      const viewCount = await this.orbit.open(this.form.dbs.views)
      await viewCount.inc()
    }).catch(err => {
      this.$router.push('/')
    })
  },
  watch: {

  }
}
</script>

<style lang="stylus">
@tailwind preflight;
@tailwind components;
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
</style>
