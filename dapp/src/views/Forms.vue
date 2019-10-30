<template lang="pug">
  .container
    .flex.flex-wrap.-mx-2
      .w-third.px-2(v-for="form in sortedForms" :key="form.id")
        .bg-white.rounded.mb-4.cursor-pointer.shadow
          .flex.flex-col
            router-link.block.no-underline(:to="{ name: 'Form', params: { id : form.id }}")
              .px-6.pt-6
                h2.font-light.text-formsid {{ form.title }}
            .px-6.pb-6
              div.flex.justify-end.items-center
                div.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.p-2.rounded.mr-2(v-if="form.public" @click="clickShareForm(form.id)")
                  i.material-icons.text-lg share
                div.bg-reddish-clear.text-reddish-glass.subtle.hover-text-white.hover-bg-reddish.p-2.rounded(@click="clickDeleteForm(form.id)")
                  i.material-icons.text-lg delete
    div(class="subtle pin max-h-screen overflow-hidden h-screen fixed w-full bg-light-smoke z-max flex items-center justify-center" @click.self="showDeleteModal = false" :class="{'pointer-events-auto opacity-100' : showDeleteModal, 'pointer-events-none opacity-0' : !showDeleteModal}")
      .bg-white.rounded.mb-4.shadow.max-w-sm
        .flex.flex-col.p-6
          h3.font-light.text-formsid.p6 Confirm deletion
          .my-4.flex.flex-col.w-full.py-4(v-if="deleteAttempt")
            p.font-light.text-formsid-darker.leading-normal Are you sure you would like to delete {{ deletingForm.title }}? Your data will be deleted; this is an irreversible action.
          div.flex.justify-end.items-center
            div.bg-reddish-clear.text-reddish-glass.subtle.hover-text-white.hover-bg-reddish.p-2.rounded.flex.items-center.cursor-pointer(@click="deleteForm(deletingForm.id)")
              i.material-icons.text-lg.mr-2 delete
              span.font-light Delete
    div(class="subtle pin max-h-screen overflow-hidden h-screen fixed w-full bg-light-smoke z-max flex items-center justify-center" @click.self="showShareModal = false" :class="{'pointer-events-auto opacity-100' : showShareModal, 'pointer-events-none opacity-0' : !showShareModal}")
      .bg-white.rounded.mb-4.shadow.max-w-sm(v-if="shareAttempt")
        .flex.flex-col.p-6
          h3.font-light.text-formsid.p6 Share {{ sharingForm.title }}
          .my-4.flex.flex-col.w-full.py-4
            p.font-light.text-formsid-darker.leading-normal.mb-4 Respondents can access {{ sharingForm.title }} by using the following link:
            input.bg-formsid-clear.font-light.text-formsid.py-3.px-3.rounded(readonly v-model="urlForSharing")
</template>

<script lang="coffee">
import { deleteFile, putFile } from 'blockstack'

export default
  store: ['collections', 'isDev', 'forms', 'user'],
  data: ->
    deleteAttempt: null,
    shareAttempt: null,
    showDeleteModal: false,
    showShareModal: false,
    isDeletingForm: false,
  computed:
    sortedForms: -> @collections.forms
    deletingForm: -> (f for f in @sortedForms when f.id is @deleteAttempt)[0] if @deleteAttempt?
    sharingForm: ->  (f for f in @sortedForms when f.id is @shareAttempt)[0] if @shareAttempt?
    urlForSharing: ->
      return '' unless @sharingForm?
      prefix = 'https://forms.id'
      prefix = 'http://localhost:8081' if @isDev
      "#{prefix}/f/#{@user.username}/#{@sharingForm.id}"

  methods:
    formUrl: (id) -> "/ui/forms/#{id}"
    clickDeleteForm: (id) ->
      @deleteAttempt = id
      @showDeleteModal = true
    deleteForm: (id) ->
      new Promise (resolve, reject) =>
        @isDeletingForm = true
        await deleteFile("shared/#{id}.json") if @deletingForm.public
        await deleteFile("forms/#{id}.json")
        @forms = Array.from(f for f in @forms when f isnt id)
        @collections.forms = f for f in @forms when f.id isnt id
        await putFile("forms.json", JSON.stringify(@forms), { encrypt : true })
        @isDeletingForm = false
        @deleteModalClosed()
        @$notify group: 'topcent', text: 'Form deleted successfully.'
        @$parent.$parent.fetchForms()
        resolve()
    deleteModalClosed: ->
      if @isDeletingForm is false
        @showDeleteModal = false
        @deleteAttempt = null
    clickShareForm: (id) ->
      @shareAttempt = id
      @showShareModal = true
</script>
