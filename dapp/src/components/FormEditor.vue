<template lang="pug">
  .min-h-screen.w-full.bg-khaki.overflow-hidden.subtle.z-max.fixed.pin.flex(:class="open")
    .sidebar.w-64.fixed.pin-l.pin-t.pin-b.shadow.bg-white.flex.flex-col.overflow-hidden
      .w-full
        .w-full.border-b.py-6
          img.table.mx-auto(style="width: 150px;" src="@/assets/images/logo.svg" alt="Forms.id")
        p.text-xs.px-6.py-3.font-normal.text-formsid-darkest.opacity-75.tracking-wide Form Configuration
        .flex.items-center.justify-between.px-6.opacity-90.text-grey-darkest.border-t.border-b.py-3
          span.font-light.text-md.mr-2 Public
          .form-switch
            input.form-switch-checkbox(type="checkbox" name="public" id="public" v-model="isPublic")
            label.form-switch-label(for="public")
        p.text-xs.px-6.py-3.font-normal.text-formsid-darkest.opacity-75.tracking-wide Form Objects
        draggable(element="collapse" :list="objects" :component-data="getDraggableData()")
          collapse-item.rounded.subtle.bg-white.text-base.text-grey-darkest.opacity-90(:title="obj.data.title" :name="obj.id" v-for="obj in objects" :key="obj.id" :class="{'hover-bg-formsid-clear' : activeTree != obj.id}")
            template(slot="title")
              .flex.items-center.w-full
                i.material-icons.text-formsid-darkest.mr-2 drag_handle
                p.h-12.overflow-hidden.text-grey-darkest.font-light {{ objectTypes.find(q => q.value == obj.data.type).label }}
            select.subtle.rounded.focus-border-b-2.border-formsid-glass.bg-formsid-clear.appearance-none.w-full.p-3.leading-tight.focus-outline-none.outline-none.greycliff.text-sm.font-light.text-formsid-darker.focus-text-formsid-glass(v-model="obj.data.type")
              option(v-for="choice in objectTypes" :key="choice.label" :value="choice.value") {{ choice.label }}
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
              span Close
          .flex
            div.flex.items-center.cursor-pointer.border-formsid-clear.border.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded(@click="clickSave()")
              i.material-icons.text-lg.mr-2 save
              span Save
            div.flex.items-center.cursor-pointer.bg-formsid-clear.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded.ml-4.subtle(@click="publishForm()" v-show="isPublic")
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
                      editable.break-words.greycliff.max-w-lg.mx-auto.text-left.text-xl.leading-loose.mb-2.text-formsid-darkest(:content.sync="obj.data.title" v-if="obj.data.type !== 'image'") {{ obj.data.title }}
                      div.flex.items-center.max-w-lg.mx-auto.py-2(v-if="['email', 'shortanswer'].indexOf(obj.data.type) > -1")
                        input(type="text" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass" v-if="obj.data.type == 'email'" :readonly="activeTree == obj.id")
                        input(type="email" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass" v-if="obj.data.type == 'shortanswer'" :readonly="activeTree == obj.id")
                      div.flex.items-center.max-w-lg.mx-auto.py-2(v-if="obj.data.type == 'paragraph'")
                        textarea(aria-label="Full name" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-darker focus:text-formsid-glass resize-none" rows="3" v-autosize :readonly="activeTree == obj.id")
                      vue-tags-input(:separators="['|']" :max-tags="4" placeholder="Add a choice" :allow-edit-tags="true" v-model="tag" :tags="tags" @tags-changed="tagsChanged" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1 && activeTree == obj.id" :id="obj.id")
                      div.flex.items-center.max-w-lg.mx-auto.py-2(v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1 && activeTree !=obj.id")
                        div.flex.flex-col.w-full(v-if="obj.data.type.indexOf('multiple') > -1")
                          div(class="greycliff bg-formsid-clear hover-bg-formsid-glass hover-text-white rounded text-center p-3 text-lg text-formsid-glass leading-tight tracking-normal cursor-pointer subtle mb-4" v-for="choice in obj.data.choices" :key="choice.label") {{ choice.label }}
                        select(v-else class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass")
                          option(v-for="choice in obj.data.choices" :key="choice.label" :value="choice.value") {{ choice.label }}
                      div.flex.items-center.max-w-lg.mx-auto.py-2.relative(v-if="obj.data.type == 'image' || obj.data.type == 'imagewlabel'")
                        img.w-full.rounded(:src="obj.data.src")
                        div(class="absolute pin flex items-center justify-center" v-if="activeTree == obj.id")
                          div(class="w-24 h-24 rounded-full bg-formsid opacity-50 flex items-center justify-center subtle hover-opacity-90 cursor-pointer" @click="clickImageInput")
                            input(type="file" ref="imageInput" multiple accept="image/*" @change="imageSelected" class="hidden")
                            i(class="fas fa-camera text-white text-2xl")
                    div.w-10.h-10.flex.items-center.justify-center.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.rounded.cursor-pointer.ml-4(v-if="activeTree == obj.id" @click="deleteObject(obj)")
                      i.material-icons.text-lg delete
</template>

<script lang="coffee">
import Draggable from 'vuedraggable'
import VueTagsInput from '@johmun/vue-tags-input'
isDev = process.env.NODE_ENV is'development'

export default
  props: ['visible', 'form']
  store: ['bus', 'collections', 'forms', 'user']
  components: { Draggable, VueTagsInput }
  data: ->
    @cleanData()
  computed:
    data6: ->
      tree = [{ label: 'Heading' }]
      tree.push({
        label: obj.data.title, id: obj.id, children: [ { label: '' } ]
      }) for obj in @objects
      tree
    vueScrollClass: -> 'form-container' : true
    open: ->
      return 'opacity-100 visible' if @visible is true and @loaded is true
      return 'opacity-0 invisible' if @visible is false
    isPublishable: ->
      @taggableObjects.map((o) -> o.data.choices.length).every((l) -> l >= 2) and
      @imageObjects.every((o) -> o.data.src.indexOf('placehold.it') is -1) and
      @objects.every((o) -> o.data.title isnt '') and @isPublic
    imageObjects: -> o for o in @objects when o.data.type is 'image'
    selectedObject: -> (o for o in @objects when o.id is @activeTree)[0]
    taggableObjects: ->
      taggable = ['dropdown', 'multipleanswer', 'multiplechoice']
      o for o in @objects when taggable.indexOf(o.data.type) > -1
  methods:
    cleanData: ->
      id: null
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
      objectTypes: [
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'email', label: 'Email' },
        { value: 'imagewlabel', label: 'Image w/ Label' },
        { value: 'image', label: 'Image' },
        { value: 'multipleanswer', label: 'Multiple Answer' },
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
      if !@taggableObjects.map((o) -> o.data.choices.length).every((l) -> l >= 2)
        @$notify({
          group: 'topcent',
          text: 'All multiple choice questions require at least two answers.'
        })
      if !@imageObjects.every((o) -> o.data.src.indexOf('placehold.it') is -1)
        @$notify({
          group: 'topcent',
          text: 'You must upload a non-placeholder image.'
        })
      if !@objects.every((o) -> o.data.title isnt '')
        @$notify({
          group: 'topcent',
          text: 'All questions require a label.'
        })
    addObject: ->
      newObject =
        id: uuid('object')
        added: Date.now()
        required: false
        data:
          type: 'multiplechoice'
          title: 'A label for your question?',
          alt: 'Image alt tag'
          src: 'https://placehold.it/700x300'
          choices: [
            { label: 'Choice 1', value: 'Choice 1' },
            { label: 'Choice 2', value: 'Choice 2' }
          ]
      @objects.push(newObject)
    clickImageInput: -> @$refs.imageInput[0].click()
    imageSelected: ->
      file = @$refs.imageInput[0].files[0]
      allowedTypes = ["image/gif", "image/jpeg", "image/png"]
      FR = new FileReader()
      FR.addEventListener "load", (e) => @selectedObject.data.src = e.target.result
      FR.readAsDataURL(file)
    tagsChanged: (tags) ->
      @tags = tags.map((t) -> text: t.text )
      @selectedObject.data.choices = tags.map((t) -> t.text).map((t) -> value: t, label: t )
    clickSave: ->
      resolution = await @saveForm()
    saveForm: ->
      return new Promise (resolve, reject) =>
        isOld = @form?.id?
        formId = @form?.id if isOld isnt false
        formId = uuid('newform') if isOld is false
        form =
          id: formId
          published: if @isPublic is true then Date.now() else false
          objects: @objects
          title: @title
          subtitle: @subtitle
          public: @isPublic
          theme: @theme
        if isOld is false
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
            reject 'form id already exists'
        else
          if @form?.public and form.public is false
            await blockstack.putFile("shared/#{form.id}.json", JSON.stringify(null))
          form.created = @form?.created
          form.dbs = @form?.dbs
          await blockstack.putFile("forms/#{form.id}.json", JSON.stringify(form), { encrypt : true })
        @modifiedWithoutSave = false
        @$notify({
          group: 'topcent',
          text: 'Form saved successfully.'
        })
        resolve(form)
        @bus.$emit 'updateforms'
    publishForm: ->
      form = await @saveForm()
      if @isPublishable and form?
        new Promise (resolve, reject) =>
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
    deleteObject: (obj) ->  @objects = @objects.filter((o) -> o.id isnt obj.id)
  watch:
    visible: (newValue, oldValue) ->
      if newValue is false
        setTimeout =>
          @[k] = @cleanData()[k] for k in Object.keys(@cleanData())
        , 1300
      if newValue is true
        unless @id?
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
    subtitle: (newValue) -> @subtitle = newValue.trim().slice(0,180) if newValue? and newValue.length > 180
</script>
