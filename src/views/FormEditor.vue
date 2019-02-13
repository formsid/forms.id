<template>
  <d-container fluid class="main-content-container px-4 pb-4 overflow-y-scroll flex-grow">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4 flex justify-between items-center">
      <!-- Page Title -->
      <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
        <editable class="page-title" :content.sync="title"></editable>
        <editable class="text-base font-light mt-3 opacity-90" :content.sync="subtitle"></editable>
      </d-col>
      <div class="flex-grow flex justify-end">
        <div class="d-flex">
          <a class="block no-underline" :href="formPreview" target="_blank">
            <d-button class="btn-outline-accent text-sm mr-3" v-if="editingForm.public && isPublic">
              <i class="material-icons">remove_red_eye</i> View
            </d-button>
          </a>
          <d-button class="btn-outline-accent text-sm" @click="clickSave()">
            <i class="material-icons">save</i> Save
          </d-button>
          <d-button class="btn-accent text-sm ml-3" @click="publishForm()" v-if="isPublic">
            <i class="material-icons">file_copy</i> Publish
          </d-button>
        </div>
      </div>
    </d-row>
    <d-row>
      <d-col lg="8" md="12">
        <editor :objects.sync="objects" ref="editor"/>
      </d-col>
      <d-col lg="4" md="12">
        <d-card class="card-small mb-3">
          <d-card-header class="border-bottom">
            <h6 class="m-0">Configuration</h6>
          </d-card-header>
          <d-card-body class="p-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Status:</strong>{{ isPublishable ? 'Ready to publish' : 'Incomplete' }} <a class="ml-auto" href="#" @click="validateObjects()" v-if="!isPublishable">Check</a> </span>
                <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Theme:</strong> Clean </span>
                <span class="d-flex mb-2"><i class="material-icons mr-1">visibility</i><strong class="mr-1">Visibility:</strong> <strong class="text-danger" v-if="!isPublic">Private</strong><strong class="text-success" v-if="isPublic">Public</strong> <a class="ml-auto" href="#" @click="isPublic = !isPublic">Edit</a></span>
              </d-list-group-item>
            </d-list-group>
          </d-card-body>
        </d-card>
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
import Editor from '@/components/Editor.vue'
const isDev = process.env.NODE_ENV == 'development'
export default {
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
  beforeRouteEnter(to, from, next){
    next(vm => {
      if(to.name == 'EditForm'){
        const form = vm.collections.forms.find(f => f.id == to.params.id)
        if(!form) next('/404')
        vm.id = form.id
        vm.title = form.title
        vm.subtitle = form.subtitle
        vm.objects = form.objects
        vm.isPublic = form.public
      } else {
        vm.addObject()
      }
      vm.loaded = true

    })
  },
  computed: {
    isNew() {
      return this.$route.name == 'NewForm'
    },
    formPreview(){
      return `${isDev ? 'http://localhost:8081' : 'https://forms.id'}/f/${this.user.username}/${this.editingForm.id}`
    },
    editingForm(){
      return !this.isNew ? this.collections.forms.find(f => f.id == this.$route.params.id) : false
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
          type: null,
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
      if(this.isNew) this.$router.push({ name: 'Forms' })
    },
    async saveForm(){
      return new Promise(async (resolve, reject) => {
        let form = {
          id: this.isNew ? this.id : this.editingForm.id,
          published: this.isPublic ? Date.now() : false,
          objects: this.$refs.editor.arrangedObjects(),
          title: this.title,
          subtitle: this.subtitle,
          public: this.isPublic,
          theme: this.theme
        }
        if(this.isNew){
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
