<template lang="pug">
  .min-h-screen.w-full.bg-khaki.overflow-hidden.subtle.z-max.fixed.pin.flex(:class="open")
    .sidebar.w-64.fixed.pin-l.pin-t.pin-b.shadow.bg-white
    .flex-grow.flex.flex-col.ml-64
      .w-full.h-32
      .w-full.overflow-hidden
        .container.h-full.px-8
          .bg-white.h-full.shadow.form-container.overflow-y-scroll.relative
            .sticky.z-max.pin-t.w-full.bg-formsid-clear(style="height: .5rem;")
            div.md-px-16.max-w-lg.mx-auto.pb-12(style="margin-top:15%;")
              div.mx-auto.pb-12
                editable.text-center.fair.mb-6.text-5xl(:content.sync="title") {{ title }}
                editable.greycliff.max-w-lg.mx-auto.text-center.text-xl.leading-loose(:content.sync="subtitle") {{ subtitle }}
              div.w-full.mb-16
                div.mb-8(v-for="obj in objects" :key="obj.id")
                  <p class="break-words greycliff max-w-lg mx-auto text-left text-xl leading-loose mb-2">{{ obj.data.title }}</p>
                  <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'shortanswer'">
                    <input type="text" :aria-label="obj.data.title" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass">
                  </div>
                  <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'paragraph'">
                    <textarea aria-label="Full name" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-darker focus:text-formsid-glass resize-none" rows="3" v-autosize></textarea>
                  </div>
                  <div class="flex items-center max-w-lg mx-auto py-2" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1">
                    <div class="flex flex-col w-full" v-if="obj.data.type.indexOf('multiple') > -1">
                      <div class="greycliff bg-formsid-clear hover-bg-formsid-glass hover-text-white rounded text-center p-3 text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle mb-4" v-for="choice in obj.data.choices" :key="choice.label">{{ choice.label }}</div>
                    </div>
                    <select v-else class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass">
                      <option v-for="choice in obj.data.choices" :key="choice.label" :value="choice.value">{{ choice.label }}</option>
                    </select>
                  </div>
                  <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'image'">
                    <img class="w-full rounded" :src="obj.data.src"/>
                  </div>
                </div>
              </div>
            </div>
  //- <d-container fluid class="main-content-container px-4 pb-4 overflow-y-scroll flex-grow">
  //-   <d-row no-gutters class="page-header py-4 flex justify-between items-center">
  //-     <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
  //-       <editable class="page-title" :content.sync="title"></editable>
  //-       <editable class="text-base font-light mt-3 opacity-90" :content.sync="subtitle"></editable>
  //-     </d-col>
  //-     <div class="flex-grow flex justify-end">
  //-       <div class="d-flex">
  //-         <a class="block no-underline" :href="formPreview" target="_blank">
  //-           <d-button class="btn-outline-accent text-sm mr-3" v-if="editingForm.public && isPublic">
  //-             <i class="material-icons">remove_red_eye</i> View
  //-           </d-button>
  //-         </a>
  //-         <d-button class="btn-outline-accent text-sm" @click="clickSave()">
  //-           <i class="material-icons">save</i> Save
  //-         </d-button>
  //-         <d-button class="btn-accent text-sm ml-3" @click="publishForm()" v-if="isPublic">
  //-           <i class="material-icons">file_copy</i> Publish
  //-         </d-button>
  //-       </div>
  //-     </div>
  //-   </d-row>
  //-   <d-row>
  //-     <d-col lg="8" md="12">
  //-       <editor :objects.sync="objects" ref="editor"/>
  //-     </d-col>
  //-     <d-col lg="4" md="12">
  //-       <d-card class="card-small mb-3">
  //-         <d-card-header class="border-bottom">
  //-           <h6 class="m-0">Configuration</h6>
  //-         </d-card-header>
  //-         <d-card-body class="p-2">
  //-           <d-list-group flush>
  //-             <d-list-group-item class="p-3">
  //-               <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Status:</strong>{{ isPublishable ? 'Ready to publish' : 'Incomplete' }} <a class="ml-auto" href="#" @click="validateObjects()" v-if="!isPublishable">Check</a> </span>
  //-               <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Theme:</strong> Clean </span>
  //-               <span class="d-flex mb-2"><i class="material-icons mr-1">visibility</i><strong class="mr-1">Visibility:</strong> <strong class="text-danger" v-if="!isPublic">Private</strong><strong class="text-success" v-if="isPublic">Public</strong> <a class="ml-auto" href="#" @click="isPublic = !isPublic">Edit</a></span>
  //-             </d-list-group-item>
  //-           </d-list-group>
  //-         </d-card-body>
  //-       </d-card>
  //-     </d-col>
  //-   </d-row>
  //- </d-container>
</template>

<script>
import Editor from '@/components/Editor.vue'
const isDev = process.env.NODE_ENV == 'development'
export default {
  props: ['visible', 'new'],
  store: ['bus', 'collections', 'forms', 'user'],
  components: {
    Editor
  },
  data() {
    return {
      id: uuid('newform'),
      title: 'Untitled Form',
      subtitle: 'Short description or note for my new form.',
      isPublic: false,
      theme: 'clean',
      objects: [],
      modifiedWithoutSave: false,
      loaded: false
    }
  },
  beforeMount(){
    if(this.new){
      this.addObject()
      this.addObject()
      this.addObject()
      this.addObject()
      this.addObject()
      this.loaded = true
    }
    // next(vm => {
    //   if(to.name == 'EditForm'){
    //     const form = vm.collections.forms.find(f => f.id == to.params.id)
    //     if(!form) next('/404')
    //     vm.id = form.id
    //     vm.title = form.title
    //     vm.subtitle = form.subtitle
    //     vm.objects = form.objects
    //     vm.isPublic = form.public
    //   } else {
    //     vm.addObject()
    //   }
    //   vm.loaded = true

    // })
  },
  computed: {
    vueScrollClass(){
      return { 'form-container' : true }
    },
    open(){
      return this.visible ? 'opacity-100 visible' : 'opacity-0 invisible'
    },
    formPreview(){
      // return `${isDev ? 'http://localhost:8081' : 'https://forms.id'}/f/${this.user.username}/${this.editingForm.id}`
      return ''
    },
    editingForm(){
      return !this.new ? this.collections.forms.find(f => f.id == this.$route.params.id) : false
    },
    isPublishable(){
      return this.taggableObjects.map(o => o.data.choices.length).every(l => l >= 2) &&
      this.objects.every(o => o.data.type !== null) &&
      this.imageObjects.every(o => o.data.src.indexOf('placehold.it') == -1) &&
      this.objects.every(o => o.data.title !== '')
    },
    imageObjects(){
      return this.objects
      ? this.objects.filter(o => o.data.type == 'image')
      : []
    },
    taggableObjects(){
      return this.objects
      ? this.objects.filter(o => ['dropdown', 'multipleanswer', 'multiplechoice']
        .indexOf(o.data.type) > -1)
      : []
    }
  },
  methods: {
    validateObjects(){
      if(!this.taggableObjects.map(o => o.data.choices.length).every(l => l >= 2)){
        this.$notify({
          group: 'topcent',
          text: 'All multiple choice questions require at least two answers.'
        })
      }
      if(!this.objects.every(o => o.data.type !== null)){
        this.$notify({
          group: 'topcent',
          text: 'All questions require a type.'
        })
      }
      if(!this.imageObjects.every(o => o.data.src.indexOf('placehold.it') == -1)){
        this.$notify({
          group: 'topcent',
          text: 'You must upload a non-placeholder image.'
        })
      }
      if(!this.objects.every(o => o.data.title !== '') ){
        this.$notify({
          group: 'topcent',
          text: 'All questions require a label.'
        })
      }
    },
    addObject() {
      let newObject  = {
        id: uuid('object'),
        added: Date.now(),
        data: {
          type: 'multipleanswer',
          title: 'Click to edit label...',
          alt: 'Image alt tag',
          src: 'https://placehold.it/700x300',
          choices: [
            { label: 'Choice 1', value: 'Choice 1' },
            { label: 'Choice 2', value: 'Choice 2' }
          ]
        }
      }
      this.objects.push(newObject)
    },
    async clickSave(){
      await this.saveForm()
      if(this.new) this.$router.push({ name: 'Forms' })
    },
    async saveForm(){
      return new Promise(async (resolve, reject) => {
        let form = {
          id: this.new ? this.id : this.editingForm.id,
          published: this.isPublic ? Date.now() : false,
          objects: this.$refs.editor.arrangedObjects(),
          title: this.title,
          subtitle: this.subtitle,
          public: this.isPublic,
          theme: this.theme
        }
        if(this.new){
          const subDb = await orbit.create(`${this.user.username}.${form.id}.submissions`, 'docstore', { write: ['*']})
          const viewDb = await orbit.create(`${this.user.username}.${form.id}.views`, 'counter', { write: ['*']})
          form.created = Date.now()
          form.dbs = {
            submissions: subDb.address.toString(),
            views: viewDb.address.toString()
          }
          if(this.forms.indexOf(form.id) == -1){
            this.forms.push(form.id)
            await blockstack.putFile(`forms.json`, JSON.stringify(this.forms), { encrypt : true })
            await blockstack.putFile(`forms/${form.id}.json`, JSON.stringify(form), { encrypt : true })
            await blockstack.putFile(`submissions/${form.id}.json`, JSON.stringify([]), { encrypt : true })
          } else {
            // form must already exist
          }
          this.bus.$emit('updateforms')
        } else {
          if(this.editingForm.public && !form.public){
            await blockstack.putFile(`shared/${form.id}.json`, JSON.stringify(null))
          }
          form.created = this.editingForm.created
          form.dbs = this.editingForm.dbs
          await blockstack.putFile(`forms/${form.id}.json`, JSON.stringify(form), { encrypt : true })
        }
        this.modifiedWithoutSave = false
        this.$notify({
          group: 'topcent',
          text: 'Form saved successfully.'
        })
        resolve()
      })
    },
    async publishForm(){
      await this.clickSave()
      if(this.isPublishable){
        return new Promise(async (resolve, reject) => {
          let form = {
            id: this.editingForm.id,
            published: Date.now(),
            created: this.editingForm.created,
            objects: this.$refs.editor.arrangedObjects(),
            title: this.title,
            subtitle: this.subtitle,
            theme: this.theme,
            dbs: this.editingForm.dbs
          }
          await blockstack.putFile(`shared/${form.id}.json`, JSON.stringify(form), { encrypt : false })
          this.$notify({
            group: 'topcent',
            text: 'Form published successfully.'
          })
          this.bus.$emit('updateforms')
          resolve()
        })
      } else {
        // couldn't publicly publish
        this.validateObjects()
        reject()
      }
    }
  },
  mounted(){
    this.bus.$on('clone-object', obj => {
      let clone = JSON.parse(JSON.stringify(obj))
      clone.id = uuid()
      clone.added = Date.now()
      this.objects.push(clone)
    })
    this.bus.$on('delete-object', id => {
      this.objects ? this.objects = this.objects.filter(o => o.id != id) : false
    })
    this.bus.$on('add-object', () => {
      this.addObject()
    })
  },
  watch: {
    visible(newValue, oldValue){
      if(!newValue) this.loaded = false
    },
    objects(newValue){
      if(newValue && this.loaded) this.modifiedWithoutSave = true
    },
    subtitle(newValue){
      if(typeof(newValue) !== 'undefined' && newValue.length > 180){
        this.subtitle = newValue.trim().slice(0,180)
      }
    }
  },

}
</script>
