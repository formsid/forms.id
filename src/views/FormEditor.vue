<template>
  <d-container fluid class="main-content-container px-4 pb-4 overflow-y-scroll flex-grow">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4 flex justify-between items-center">
      <!-- Page Title -->
      <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
        <editable class="page-title" :content="title" @update="title = $event"></editable>
      </d-col>
      <div class="flex-grow flex justify-end">
        <div class="d-flex">
          <d-button class="btn-outline-accent text-sm mr-3">
            <i class="material-icons">remove_red_eye</i> Preview
          </d-button>
          <d-button class="btn-outline-accent text-sm mr-3" @click="saveForm()">
            <i class="material-icons">save</i> Save
          </d-button>
          <d-button class="btn-accent text-sm" @click="publishForm()">
            <i class="material-icons">file_copy</i> Publish
          </d-button>
        </div>
      </div>
    </d-row>
    <d-row>
      <d-col lg="8" md="12">
        <editor :objects.sync="objects"/>
        <div class="flex w-full">
          <div class="w-1/3 mx-2 cursor-pointer text-center flex items-center justify-center mb-3 bg-white px-4 py-3 rounded card-small hover:bg-pale-khaki" @click="addObject('question')">
            <i class="far fa-question-circle opacity-75 text-xl mr-3"></i>
            <span class="text-muted font-light opacity-90 text-lg">Question</span>
          </div>
          <div class="w-1/3 mx-2 cursor-pointer text-center flex items-center justify-center mb-3 bg-white px-4 py-3 rounded card-small hover:bg-pale-khaki">
            <i class="fas fa-heading opacity-75 text-xl mr-3"></i>
            <span class="text-muted font-light opacity-90 text-lg">Heading</span>
          </div>
          <div class="w-1/3 mx-2 cursor-pointer text-center flex items-center justify-center mb-3 bg-white px-4 py-3 rounded card-small hover:bg-pale-khaki" @click="addObject('image')">
            <i class="far fa-image opacity-75 text-xl mr-3"></i>
            <span class="text-muted font-light opacity-90 text-lg">Image</span>
          </div>
        </div>
      </d-col>
      <d-col lg="4" md="12">
        <d-card class="card-small mb-3">
          <d-card-header class="border-bottom">
            <h6 class="m-0">Configuration</h6>
          </d-card-header>
          <d-card-body class="p-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Status:</strong> {{ this.isPublishable ? 'Ready to publish' : 'Incomplete' }} </span>
                <span class="d-flex mb-2"><i class="material-icons mr-1">flag</i><strong class="mr-1">Theme:</strong> Clean <a class="ml-auto" href="#">Edit</a></span>
                <span class="d-flex mb-2"><i class="material-icons mr-1">visibility</i><strong class="mr-1">Visibility:</strong> <strong class="text-danger" v-if="!public">Private</strong><strong class="text-success" v-if="public">Public</strong> <a class="ml-auto" href="#" @click="public = !public">Edit</a></span>
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

export default {
  store: ['bus', 'collections', 'forms'],
  components: {
    Editor
  },
  data() {
    return {
      id: uuid('newform'),
      title: 'Untitled Form',
      public: false,
      theme: 'clean',
      objects: null,
      modifiedWithoutSave: false,
      loaded: false
    }
  },
  beforeRouteEnter(to, from, next){
    next(vm => {
      if(to.name == 'EditForm'){
        const form = JSON.parse(JSON.stringify(vm.collections.forms.find(f => f.id == to.params.id)))
        if(!form) next('/404')
        vm.id = form.id
        vm.title = form.title
        vm.objects = form.objects
        vm.public = form.public
      } else {
        vm.objects = [
          { id: uuid(), type: 'question', added: Date.now(), data : {
            title: 'New question. Click to edit...',
            type: 'dropdown',
            choices: [
              { label: 'Choice 1', value: 'Choice 1' },
              { label: 'Choice 2', value: 'Choice 2' }
            ]
          }}
        ]
      }
      vm.loaded = true
    })
  },
  computed: {
    isNew() {
      return this.$route.name == 'NewForm'
    },
    editingForm(){
      return !this.isNew ? this.collections.forms.find(f => f.id == this.$route.params.id) : false
    },
    isPublishable(){
      return this.taggableObjects.map(o => o.data.choices.length).every(l => l >= 2)
    },
    taggableObjects(){
      return this.objects
      ? this.objects.filter(o => o.type == 'question')
        .filter(o => ['dropdown', 'radio', 'checkboxes']
        .indexOf(o.data.type) > -1)
      : []
    }
  },
  methods: {
    validateObjects(){

    },
    addObject(type) {
      if(type == 'heading'){

      } else if(type == 'question'){
        this.objects.push({ id: uuid(), added: Date.now(), type: 'question', data : {
          title: 'New question. Click to edit...',
          type: null, // dropdown, radio, check,
          choices: [
            { label: 'Choice 1', value: 'Choice 1' },
            { label: 'Choice 2', value: 'Choice 2' }
          ]
        }})
      } else if(type == 'image'){
        this.objects.push({ id: uuid(), added: Date.now(), type: 'image', data : {
          title: 'New image. Click to edit label...',
          alt: 'Image alt tag',
          src: 'https://picsum.photos/700/300?random=' + Math.random()
        }})
      }
    },
    async saveForm(){
      return new Promise(async (resolve, reject) => {
        let form = {
          id: this.id,
          published: false,
          created: Date.now(),
          objects: this.objects,
          title: this.title,
          public: this.public,
          theme: this.theme
        }
        if(this.isNew){
          if(this.forms.indexOf(form.id) == -1){
            this.forms.push(form.id)
            await blockstack.putFile(`forms.json`, JSON.stringify(this.forms), { encrypt : true })
            await blockstack.putFile(`forms/${form.id}.json`, JSON.stringify(form), { encrypt : true })
          } else {
            // form must already exist
          }
        } else {
          await blockstack.putFile(`forms/${form.id}.json`, JSON.stringify(form), { encrypt : true })
        }
        this.bus.$emit('fetchforms')
        this.modifiedWithoutSave = false
        resolve()
      })
    },
    publishForm(){
      this.saveForm()
      if(this.isPublishable){
        return new Promise(async (resolve, reject) => {
          let form = {
            id: this.id,
            published: false,
            created: Date.now(),
            objects: this.objects,
            title: this.title,
            public: true,
            theme: this.theme
          }
          await blockstack.putFile(`shared/${form.id}.json`, JSON.stringify(form), { encrypt : true })
        })
      } else {
        // couldn't publicly publish
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
  },
  watch: {
    editingId(value){
      if(this.selectedObject && this.selectedObject.type == 'question'){
        this.tags = this.selectedObject.data.choices.map(c => { return { text: c.label } })
      }
    }
  },
  objects(newValue){
    if(newValue && this.loaded) this.modifiedWithoutSave = true
  }
}
</script>
