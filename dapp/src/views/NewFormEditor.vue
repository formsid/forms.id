<template lang="pug">
  .min-h-screen.w-full.bg-khaki.overflow-hidden.subtle.z-max.fixed.pin.flex(:class="open")
    .sidebar.w-64.fixed.pin-l.pin-t.pin-b.shadow.bg-white.flex.flex-col.overflow-hidden
      .w-full
        .w-full.border-b.py-6.mb-4
          img.table.mx-auto(style="width: 150px;" src="@/assets/images/logo.svg" alt="Forms.id")
        p.text-xs.px-6.py-3.font-normal.text-formsid-darkest.opacity-75.tracking-wide Form Objects
        draggable(element="collapse" :list="objects" :component-data="getDraggableData()")
          collapse-item.rounded.subtle.bg-white.text-base.text-grey-darkest.opacity-90(:title="obj.data.title" :name="obj.id" v-for="obj in objects" :key="obj.id" :class="{'hover-bg-formsid-clear' : activeTree != obj.id}")
            template(slot="title")
              .flex.items-center.w-full
                i.material-icons.text-formsid-darkest.mr-2 drag_handle
                p.h-12.overflow-hidden.text-formsid-darkest.font-light {{ questionTypes.find(q => q.value == obj.data.type).label }}
            select.subtle.rounded.focus-border-b-2.border-formsid-glass.bg-formsid-clear.appearance-none.w-full.p-3.leading-tight.focus-outline-none.outline-none.greycliff.text-sm.font-light.text-formsid-darker.focus-text-formsid-glass(v-model="obj.data.type")
              option(v-for="choice in questionTypes" :key="choice.label" :value="choice.value") {{ choice.label }}
            .flex.items-center.mt-4.justify-between
              span.font-light.text-md.mr-2 Required
              .form-switch
                input.form-switch-checkbox(type="checkbox" :name="obj.id" :id="obj.id" v-model="obj.required")
                label.form-switch-label(:for="obj.id")
        div.flex.items-center.justify-center.mt-4.subtle
          div(class="hover-bg-formsid text-formsid-glass hover-text-white bg-formsid-clear opacity-75 subtle rounded-full w-12 h-12 cursor-pointer flex items-center justify-center" @click="addObject()")
            i.fas.fa-plus.text-xl
    .flex-grow.flex.flex-col.ml-64
      .w-Full.py-4
        .container.flex.justify-between.items-center.px-8
          .flex
            div.flex.items-center.cursor-pointer.border-reddish-clear.border.px-4.subtle.hover-bg-reddish.hover-text-white.font-light.text-reddish.py-3.rounded.mr-4(@click="bus.$emit('closeformeditor')")
              i.material-icons.text-lg.mr-2 cancel
              span Cancel
          .flex
            div.flex.items-center.cursor-pointer.border-formsid-clear.border.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded.mr-4
              i.material-icons.text-lg.mr-2 remove_red_eye
              span View
            div.flex.items-center.cursor-pointer.border-formsid-clear.border.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded.mr-4(@click="clickSave()")
              i.material-icons.text-lg.mr-2 save
              span Save
            div.flex.items-center.cursor-pointer.bg-formsid-clear.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded
              i.material-icons.text-lg.mr-2 file_copy
              span Publish
      .w-full.overflow-hidden.flex-grow
        .container.h-full.px-8
          .bg-white.h-full.shadow.form-container.overflow-y-scroll.relative
            .sticky.z-max.pin-t.w-full.bg-formsid-clear(style="height: .5rem;")
            div.md-px-16.max-w-lg.mx-auto.pb-12(style="margin-top:15%;")
              div.mx-auto.pb-12
                editable.text-center.fair.mb-6.text-5xl.text-formsid-darkest(:content.sync="title") {{ title }}
                editable.greycliff.max-w-lg.mx-auto.text-center.text-xl.leading-loose.text-formsid-darker(:content.sync="subtitle") {{ subtitle }}
              div.w-full.mb-16
                div.mb-8.py-6.px-8.subtle.bg-formsid-transparent(v-for="obj in objects" :key="obj.id" :class="{ 'rounded-lg bg-formsid-clear' : activeTree == obj.id }")
                  div.flex.items-center
                    div.flex-grow
                      editable.break-words.greycliff.max-w-lg.mx-auto.text-left.text-xl.leading-loose.mb-2.text-formsid-darkest(:content.sync="obj.data.title") {{ obj.data.title }}
                      <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'shortanswer'">
                        <input type="text" :aria-label="obj.data.title" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass">
                      </div>
                      <div class="flex items-center max-w-lg mx-auto py-2" v-if="obj.data.type == 'paragraph'">
                        <textarea aria-label="Full name" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-darker focus:text-formsid-glass resize-none" rows="3" v-autosize></textarea>
                      </div>
                      <vue-tags-input :separators="['|']" :max-tags="4" placeholder="Add a choice" :allow-edit-tags="true" v-model="tag" :tags="tags" @tags-changed="tagsChanged" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1 && activeTree == obj.id" :id="obj.id"/>
                      <div class="flex items-center max-w-lg mx-auto py-2" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1 && activeTree !=obj.id">
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
                    div.w-10.h-10.flex.items-center.justify-center.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.rounded.cursor-pointer.ml-4(v-if="activeTree == obj.id" @click="deleteObject(obj)")
                      i.material-icons.text-lg delete

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

<script lang="coffee">
import Draggable from 'vuedraggable'
import Editor from '@/components/Editor.vue'
import VueTagsInput from '@johmun/vue-tags-input'
isDev = process.env.NODE_ENV is'development'
export default
  props: ['visible', 'form']
  store: ['bus', 'collections', 'forms', 'user']
  components: { Draggable, Editor, VueTagsInput }
  data: ->
    @cleanData()
  computed:
    data6: ->
      tree = [{ label: 'Heading' }]
      tree.push({
        label: obj.data.title, id: obj.id, children: [ { label: '' } ]
      }) for obj in @objects
      tree
    vueScrollClass: -> { 'form-container' : true }
    open: ->
      return 'opacity-100 visible' if @visible is true and @loaded is true
      return 'opacity-0 invisible' if @visible is false
    formPreview: ->
      # // return `${isDev ? 'http://localhost:8081' : 'https://forms.id'}/f/${@user.username}/${@form.id}`
      ''
    isPublishable: -> false
      # return @taggableObjects.map(o => o.data.choices.length).every(l => l >= 2) &&
      # @objects.every(o) -> o.data.type isnt null &&
      # @imageObjects.every(o) -> o.data.src.indexOf('placehold.it') is -1 &&
      # @objects.every(o) -> o.data.title isnt ''
    imageObjects: -> o for o in @objects when o.data.type is 'image'
    selectedObject: -> (o for o in @objects when o.id is @activeTree)[0]
    taggableObjects: ->
      taggable = ['dropdown', 'multipleanswer', 'multiplechoice']
      o for o in @objects when taggable.indexOf(o.data.type) > -1
  methods:
    cleanData: ->
      id: uuid('newform')
      title: 'Untitled Form'
      subtitle: 'Short description or note for my new form.'
      isPublic: false
      theme: 'clean'
      objects: []
      modifiedWithoutSave: false
      loaded: false
      activeTree: '1',
      tag: '',
      tags: [],
      questionTypes: [
        { value: null, label: 'Select a question type' },
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'image', label: 'Image' },
        # // { value: 'multipleanswer', label: 'Multiple Answer' },
        { value: 'multiplechoice', label: 'Multiple Choice' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'shortanswer', label: 'Short Answer' }
      ]
    getDraggableData: ->
      props:
        accordion: true
        value: @activeTree
      on:
        change: @handleChooseEvent
    handleChooseEvent: (event) -> @activeTree = event
    validateObjects: ->
      if !@taggableObjects.map(o) -> o.data.choices.length.every(l) -> l >= 2
        @$notify({
          group: 'topcent',
          text: 'All multiple choice questions require at least two answers.'
        })
      if !@objects.every(o) -> o.data.type isnt null
        @$notify({
          group: 'topcent',
          text: 'All questions require a type.'
        })
      if !@imageObjects.every(o) -> o.data.src.indexOf('placehold.it') is -1
        @$notify({
          group: 'topcent',
          text: 'You must upload a non-placeholder image.'
        })
      if !@objects.every(o) -> o.data.title isnt ''
        @$notify({
          group: 'topcent',
          text: 'All questions require a label.'
        })
    addObject: ->
      newObject =
        id: uuid('object')
        added: Date.now()
        data:
          type: 'multiplechoice'
          title: 'This is a new label',
          alt: 'Image alt tag'
          src: 'https://placehold.it/700x300'
          choices: [
            { label: 'Choice 1', value: 'Choice 1' },
            { label: 'Choice 2', value: 'Choice 2' }
          ]
      @objects.push(newObject)
    tagsChanged: (tags) ->
      @tags = tags.map((t) -> text: t.text )
      @selectedObject.data.choices = tags.map((t) -> t.text).map((t) -> value: t, label: t )
    clickSave: ->
      await @saveForm()
      @$router.push({ name: 'Forms' }) if @form is null
      @bus.$emit('closeformeditor')
    saveForm: ->
      new Promise (resolve, reject) =>
        form =
          id: if @form is null then uuid('newform') else @form.id
          published: if @isPublic is true then Date.now() else false
          objects: @objects
          title: @title
          subtitle: @subtitle
          public: @isPublic
          theme: @theme
        if @form is null
          subDb = await orbit.create("#{@user.username}.#{form.id}.submissions", 'docstore', { write: ['*']})
          viewDb = await orbit.create("#{@user.username}.#{form.id}.views", 'counter', { write: ['*']})
          form.created = Date.now()
          form.dbs =
            submissions: subDb.address.toString()
            views: viewDb.address.toString()
          if @forms.indexOf(form.id) is -1
            @forms.push(form.id)
            await blockstack.putFile("forms.json", JSON.stringify(@forms), { encrypt : true })
            await blockstack.putFile("forms/#{form.id}.json", JSON.stringify(form), { encrypt : true })
            await blockstack.putFile("submissions/#{form.id}.json", JSON.stringify([]), { encrypt : true })
          else
            # // form must already exist
          @bus.$emit 'updateforms'
        else
          if @form.public and form.public is false
            await blockstack.putFile("shared/#{form.id}.json", JSON.stringify(null))
          form.created = @form.created
          form.dbs = @form.dbs
          await blockstack.putFile("forms/#{form.id}.json", JSON.stringify(form), { encrypt : true })
        @modifiedWithoutSave = false
        @$notify({
          group: 'topcent',
          text: 'Form saved successfully.'
        })
        resolve()
    publishForm: ->
      await @clickSave()
      if @isPublishable
        new Promise (resolve, reject) ->
          form =
            id: @form.id
            published: Date.now()
            created: @form.created
            objects: @objects
            title: @title
            subtitle: @subtitle
            theme: @theme
            dbs: @form.dbs
          await blockstack.putFile("shared/#{form.id}.json", JSON.stringify(form), { encrypt : false })
          @$notify({
            group: 'topcent',
            text: 'Form published successfully.'
          })
          @bus.$emit 'updateforms'
          resolve()
      else
        # // couldn't publicly publish
        @validateObjects()
        reject()
    deleteObject: (obj) ->  @objects = @objects.filter((o) -> o.id isnt obj.id)
  mounted: ->
    @bus.$on 'clone-object', (obj) ->
      clone = JSON.parse(JSON.stringify(obj))
      clone.id = uuid()
      clone.added = Date.now()
      @objects.push(clone)
  watch:
    visible: (newValue, oldValue) ->
      @[k] = @cleanData()[k] for k in Object.keys(@cleanData()) if newValue is false
      if newValue is true
        unless @form?
          @addObject()
          @addObject()
          @activeTree = @objects[0].id.toString()
          @loaded = true
        if @form?
          clone = JSON.parse(JSON.stringify(@form))
          @id = clone.id
          @title = clone.title
          @subtitle = clone.subtitle
          @objects = clone.objects
          @isPublic = clone.public
          @loaded = true
    selectedObject: (value) ->
      @tags = @selectedObject.data.choices.map((c) -> text: c.label) if @selectedObject?
    objects: (newValue) ->
      @modifiedWithoutSave = true if newValue and @loaded
    subtitle: (newValue) ->
      @subtitle = newValue.trim().slice(0,180) if newValue? and newValue.length > 180
</script>
