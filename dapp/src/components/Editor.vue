<template>
  <d-card class="card-small mb-3">
    <d-card-body>
      <SlickList lockAxis="y" :useDragHandle="true" :value="editorObjects" v-model="editorObjects">
        <SlickItem v-for="(obj, index) in editorObjects" :index="index" :key="index">
          <div class="flex items-center mb-4">
            <i class="fas fa-arrows-alt text-formsid text-xl mr-3 cursor-move" v-handle></i>
            <template>
              <div class="subtle cursor-pointer flex-grow p-3 rounded border bg-white hover:bg-pale-khaki" :class="{'bg-pale-khaki' : editingId == obj.id }" :key="obj.id" @click="editingId = obj.id">
                <div class="flex items-center justify-between mb-3">
                  <editable :content.sync="obj.data.title" class="flex-grow mr-2 text-muted d-block text-base font-light overflow-hidden"></editable>
                  <div class="flex mb-auto ml-auto" v-if="editingId == obj.id">
                    <d-button size="sm" class="btn-white" @click="cloneObj(obj)">
                      <i class="far fa-clone"></i>
                    </d-button>
                    <d-button size="sm" class="ml-2 btn-white" @click="deleteObj(obj.id)">
                      <i class="far fa-trash-alt"></i>
                    </d-button>
                  </div>
                </div>
                <d-form-select size="lg" :options="questionTypes" v-model="obj.data.type"/>
                <div class="border-top mt-3 pt-3" v-if="editingId == obj.id">
                  <vue-tags-input :separators="['|']" :max-tags="4" placeholder="Add a choice" :allow-edit-tags="true" v-model="tag" :tags="tags" @tags-changed="tagsChanged" v-if="taggable"/>
                  <div class="w-full relative" v-if="obj.data.type == 'image'">
                    <img class="w-full" :src="obj.data.src" :alt="obj.data.alt">
                    <div class="absolute pin flex items-center justify-center" >
                      <div class="w-24 h-24 rounded-full bg-formsid opacity-75 flex items-center justify-center subtle hover:opacity-100" @click="clickImageInput">
                        <input type="file" ref="imageInput" multiple accept="image/*" @change="imageSelected" class="hidden">
                        <i class="fas fa-camera text-white text-2xl"></i>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 ml-auto table">
                    <d-checkbox inline v-model="obj.required" toggle></d-checkbox>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </SlickItem>
      </SlickList>
      <div class="flex items-center justify-center">
        <div class="hover:opacity-100 bg-formsid opacity-75 subtle rounded-full w-16 h-16 cursor-pointer flex items-center justify-center" @click="addObj()">
          <i class="fas fa-plus text-white text-xl"></i>
        </div>
      </div>
    </d-card-body>
  </d-card>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'
import { SlickList, SlickItem, HandleDirective } from 'vue-slicksort'

export default {
  name: 'editor',
  store: ['bus'],
  components: { SlickItem, SlickList, VueTagsInput },
  directives: { handle: HandleDirective },
  props: ['objects'],
  data() {
    return {
      editingId: null,
      selectedChoice: null,
      questionTypes: [
        { value: null, text: 'Select a question type' },
        { value: 'dropdown', text: 'Dropdown' },
        { value: 'image', text: 'Image' },
        // { value: 'multipleanswer', text: 'Multiple Answer' },
        { value: 'multiplechoice', text: 'Multiple Choice' },
        { value: 'paragraph', text: 'Paragraph' },
        { value: 'shortanswer', text: 'Short Answer' }
      ],
      tag: '',
      tags: [],
      editorObjects: []
    }
  },
  computed: {
    selectedObject(){
      return this.editingId ? this.objects.find(o => o.id == this.editingId) : false
    },
    taggable(){
      const type = this.selectedObject.data.type
      return typeof(type) !== 'undefined'
        && ['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(type) > -1
    }
  },
  methods: {
    addObj(){
      this.bus.$emit('add-object')
    },
    cloneObj(obj){
      this.bus.$emit('clone-object', obj)
    },
    deleteObj(id){
      this.bus.$emit('delete-object', id)
    },
    clickImageInput(){
      this.$refs.imageInput[0].click()
    },
    imageSelected(){
      const file = this.$refs.imageInput[0].files[0]
      const allowedTypes = ["image/gif", "image/jpeg", "image/png"]
      const FR = new FileReader()
      FR.addEventListener("load", e => {
        this.selectedObject.data.src = e.target.result
      })
      FR.readAsDataURL(file)
    },
    tagsChanged(tags){
      this.tags = tags.map(t => { return { text: t.text } })
      this.selectedObject.data.choices = tags.map(t => t.text).map(t => { return { value: t, label: t } })
    },
    arrangedObjects(){
      const arrangedOrder = this.editorObjects.map(o => o.id)
      let objects = []
      arrangedOrder.forEach(o => {
        objects.push(this.objects.find(obj => obj.id == o))
      })
      return objects
    }
  },
  mounted() {

  },
  watch: {
    editingId(value){
      this.tags = this.selectedObject
        ? this.selectedObject.data.choices.map(c => { return { text: c.label } })
        : []
    },
    objects(newVal, oldVal){
      if(newVal){
        this.editorObjects = newVal
      }
      if(oldVal && oldVal.length > 0){
        if(newVal.length > 0){
          const objs = JSON.parse(JSON.stringify(newVal))
          const newestObj = objs.sort((a, b) => new Date(b.added) - new Date(a.added))[0]
          this.editingId = newestObj.id
        }
      }
    }
  }
}
</script>

