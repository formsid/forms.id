<template lang="pug">
  .container
    .flex.flex-wrap.-mx-2
      .w-third.px-2(v-for="form in sortedForms" :key="form.id")
        .bg-white.rounded.mb-4.cursor-pointer.shadow
          .flex.flex-col
            router-link.block.no-underline(:to="formUrl(form.id)")
              .px-6.pt-6
                h2.font-light.text-formsid {{ form.title }}
            router-link.block.no-underline(:to="formUrl(form.id)")
              .my-4.flex.flex-col.w-full.py-4
                //- .px-6.py-2.flex.flex-col
                //-   span.my-2.font-light.text-formsid-darker {{ form.submissions.length }} Submissions
                //-   span.my-2.font-light.text-formsid-darker {{ form.submissions.length }} Views
            .px-6.pb-6
              div.flex.justify-end.items-center
                div.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.p-2.rounded.mr-2
                  i.material-icons.text-lg share
                div.bg-reddish-clear.text-reddish-glass.subtle.hover-text-white.hover-bg-reddish.p-2.rounded(@click="clickDeleteForm(form.id)")
                  i.material-icons.text-lg delete
    div(class="subtle pin max-h-screen overflow-hidden h-screen fixed w-full bg-light-smoke z-max flex items-center justify-center" @click.self="showDeleteModal = false" :class="{'pointer-events-auto opacity-100' : showDeleteModal, 'pointer-events-none opacity-0' : !showDeleteModal}")
      .bg-white.rounded.mb-4.cursor-pointer.shadow.max-w-sm
        .flex.flex-col.p-6
          h3.font-light.text-formsid.p6 Confirm deletion
          .my-4.flex.flex-col.w-full.py-4(v-if="deleteAttempt")
            p.font-light.text-formsid-darker.leading-normal Are you sure you would like to delete {{ deletingForm.title }}? Your data will be deleted; this is an irreversible action.
          div.flex.justify-end.items-center
            div.bg-reddish-clear.text-reddish-glass.subtle.hover-text-white.hover-bg-reddish.p-2.rounded.flex.items-center(@click="deleteForm(deletingForm.id)")
              i.material-icons.text-lg.mr-2 delete
              span.font-light Delete
</template>

<script lang="coffee">
export default
  store: ['bus', 'collections', 'forms'],
  data: ->
    deleteAttempt: null,
    showDeleteModal: false,
    isDeletingForm: false,
  computed:
    sortedForms: -> @collections.forms
    deletingForm: -> (f for f in @sortedForms when f.id is @deleteAttempt)[0] if @deleteAttempt?
  methods:
    formUrl: (id) -> "/ui/forms/#{id}"
    clickDeleteForm: (id) ->
      @deleteAttempt = id
      @showDeleteModal = true
    deleteForm: (id) ->
      new Promise (resolve, reject) =>
        @isDeletingForm = true
        await blockstack.putFile("shared/#{id}.json", JSON.stringify(null)) if @deletingForm.public
        await blockstack.putFile("forms/#{id}.json", JSON.stringify(null))
        @forms = Array.from(f for f in @forms when f isnt id)
        @collections.forms = f for f in @forms when f.id isnt id
        await blockstack.putFile("forms.json", JSON.stringify(@forms), { encrypt : true })
        @isDeletingForm = false
        @deleteModalClosed()
        @$notify group: 'topcent', text: 'Form deleted successfully.'
        @bus.$emit 'updateforms'
        resolve()
    deleteModalClosed: ->
      if @isDeletingForm is false
        @showDeleteModal = false
        @deleteAttempt = null
</script>
