<template>
  <d-card class="card-small mb-3">
    <d-card-body>
      <template v-for="obj in objects">
        <div class="subtle cursor-pointer p-3 rounded border hover:bg-pale-khaki mb-4" :class="{'bg-pale-khaki' : editingId == obj.id }" :key="obj.id" v-if="obj.type == 'image'" @click="editingId = obj.id">
          <div class="flex items-center justify-between mb-3">
            <editable :content="obj.data.title" @update="obj.data.title = $event" class="text-muted d-block text-base font-light"></editable>
            <div class="my-auto ml-auto" v-if="editingId == obj.id">
              <d-button size="sm" class="btn-white" @click="cloneObj(obj)">
                <i class="far fa-clone"></i>
              </d-button>
              <d-button size="sm" class="ml-2 btn-white" @click="deleteObj(obj.id)">
                <i class="far fa-trash-alt"></i>
              </d-button>
            </div>
          </div>
          <img :src="obj.data.src" :alt="obj.data.alt">
        </div>
        <div class="subtle cursor-pointer p-3 rounded border hover:bg-pale-khaki mb-4" :class="{'bg-pale-khaki' : editingId == obj.id }" :key="obj.id" v-if="obj.type == 'question'" @click="editingId = obj.id">
          <div class="flex items-center justify-between mb-3">
            <editable :content="obj.data.title" @update="obj.data.title = $event" class="text-muted d-block text-base font-light"></editable>
            <div class="my-auto ml-auto" v-if="editingId == obj.id">
              <d-button size="sm" class="btn-white" @click="cloneObj(obj)">
                <i class="far fa-clone"></i>
              </d-button>
              <d-button size="sm" class="ml-2 btn-white" @click="deleteObj(obj.id)">
                <i class="far fa-trash-alt"></i>
              </d-button>
            </div>
          </div>
          <!-- <d-input size="lg" readonly v-if="obj.data.type == 'text'"/> -->
          <d-form-select size="lg" :options="questionTypes" v-model="obj.data.type"/>
          <div class="border-top mt-3 pt-3" v-if="editingId == obj.id">
            <vue-tags-input :separators="['|']" :max-tags="4" placeholder="Add a choice" :allow-edit-tags="true" v-model="tag" :tags="tags" v-if="taggable" @tags-changed="tagsChanged" />
          </div>
        </div>
      </template>
    </d-card-body>
  </d-card>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  name: 'editor',
  store: ['bus'],
  components: { VueTagsInput },
  props: ['objects'],
  data() {
    return {
      editingId: null,
      selectedChoice: null,
      questionTypes: [
        { value: null, text: 'Select a question type' },
        { value: 'checkboxes', text: 'Checkboxes' },
        { value: 'dropdown', text: 'Dropdown' },
        { value: 'radio', text: 'Radio' },
        { value: 'text', text: 'Short Answer' },
        { value: 'paragraph', text: 'Paragraph' },

      ],
      tag: '',
      tags: []
    }
  },
  computed: {
    selectedObject(){
      return this.editingId ? this.objects.find(o => o.id == this.editingId) : false
    },
    taggable(){
      const type = this.selectedObject.data.type
      return typeof(type) !== 'undefined'
        && ['dropdown', 'radio', 'checkboxes'].indexOf(type) > -1
    }
  },
  methods: {
    cloneObj(obj){
      this.bus.$emit('clone-object', obj)
    },
    deleteObj(id){
      this.bus.$emit('delete-object', id)
    },
    tagsChanged(tags){
      this.tags = tags.map(t => { return { text: t.text } })
      this.selectedObject.data.choices = tags.map(t => t.text).map(t => { return { value: t, label: t } })
    }
  },
  mounted() {

  },
  watch: {
    editingId(value){
      if(this.selectedObject && this.selectedObject.type == 'question'){
        this.tags = this.selectedObject.data.choices.map(c => { return { text: c.label } })
      }
    },
    objects(newVal, oldVal){
      if(oldVal && oldVal.length > 0){
        const objs = JSON.parse(JSON.stringify(newVal))
        const newestObj = objs.sort((a, b) => new Date(b.added) - new Date(a.added))[0]
        this.editingId = newestObj.id
      }
    }
  }
}
</script>

