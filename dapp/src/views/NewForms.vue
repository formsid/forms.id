<template lang="pug">
  .container
    .flex.flex-wrap.-mx-2
      .w-third.px-2(v-for="form in sortedForms" :key="form.id")
        router-link.block.no-underline(:to="formUrl(form.id)")
          .bg-white.rounded.mb-4.cursor-pointer.shadow
            .flex.flex-col
              .px-6.pt-6
                h2.font-light.text-formsid {{ form.title }}
              .my-4.flex.flex-col.w-full.py-8
                //- .px-6.py-2.flex.flex-col
                //-   span.my-2.font-light.text-formsid-darker {{ form.submissions.length }} Submissions
                //-   span.my-2.font-light.text-formsid-darker {{ form.submissions.length }} Views
              .px-6.pb-6
                div.flex.justify-end.items-center
                  div.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.p-2.rounded.mr-2
                    i.material-icons.text-lg share
                  div.bg-formsid-clear.text-formsid-glass.subtle.hover-text-white.hover-bg-formsid.p-2.rounded
                    i.material-icons.text-lg(@click="clickDeleteForm(form.id)") delete
    <d-modal v-if="showDeleteModal" @close="deleteModalClosed">
      <d-modal-header>
          <d-modal-title>Confirm deletion</d-modal-title>
      </d-modal-header>
      <d-modal-body class="text-base">Are you sure you would like to delete <b>{{ deletingForm.title }}</b>? Your data will be deleted; this is an irreversible action.</d-modal-body>
      <d-modal-footer>
        <d-button class="btn-danger text-sm" @click="deleteForm(deleteAttempt)">
          <i class="material-icons">delete</i> Delete
        </d-button>
      </d-modal-footer>
    </d-modal>
</template>

<script lang="coffee">
export default
  store: ['bus', 'collections', 'forms'],
  data: ->
    deleteAttempt: null,
    showDeleteModal: false,
    isDeletingForm: false,
  computed:
    sortedForms: ->
      @collections.forms
      { id: item, title: 'My Awesome Form', submissions: [] } for item in [0,1,2,3,4]
    deletingForm: -> @sortedForms.find (f) -> f.id is @deleteAttempt if deleteAttempt?
  methods:
    formUrl: (id) -> "/ui/forms/#{id}"
    clickDeleteForm: (id) ->
      @deleteAttempt = id
      @showDeleteModal = true
    deleteForm: (id) =>
      new Promise async (resolve, reject) ->
        @isDeletingForm = true
        await blockstack.putFile("shared/#{id}.json", JSON.stringify(null)) if @deletingForm.public
        await blockstack.putFile("forms/#{id}.json", JSON.stringify(null))
        @forms = @forms.filter (f) -> f isnt id
        @collections.forms = @collections.forms.filter (f) -> f isnt id
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
