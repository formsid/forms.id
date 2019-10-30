<template lang="pug">
  .container
    .flex.w-full
      div.bg-white.rounded.w-full.shadow
        .border-b
          .p-6.flex.justify-between.max-w-lg.mx-auto
            .text-center.flex.flex-col(v-if="form.submissions")
              h4.mb-2.font-light.text-2xl.text-formsid-darkest {{ form.submissions.length }}
              span.font-light.text-uppercase.text-formsid-darker Submissions
            .text-center.flex.flex-col
              h4.mb-2.font-light.text-2xl.text-formsid-darkest {{ completionRate }}%
              span.font-light.text-uppercase.text-formsid-darker Avg. Completion Rate
            .text-center.flex.flex-col
              h4.mb-2.font-light.text-2xl.text-formsid-darkest {{ form.views }}
              span.font-light.text-uppercase.text-formsid-darker Views
        table.w-full.px-8
          thead
            tr
              th.px-4.py-4.font-light.text-formsid-darkest(scope="col") #
              th.px-4.py-4.font-light.text-formsid-darkest(scope="col") Data
              th.px-4.py-4.font-light.text-formsid-darkest(scope="col") Timestamp
          tbody(v-if="form.submissions")
            tr.subtle.border-t.hover-bg-formsid-pale.cursor-pointer(v-for="(record, i) in form.submissions" :key="record._id" @click="rowClicked(record._id)")
              td.px-4.py-4.font-light.text-formsid-darkest.text-center {{ i + 1 }}
              td.px-4.py-4.font-light.text-formsid-darkest.text-center Click to view data
              td.px-4.py-4.font-light.text-formsid-darkest.text-center {{ timestamp(record.created) }}
        p.py-4.text-center.font-light.text-formsid-darker.border-t(v-if="form.submissions && !form.submissions.length") No submissions, yet.
      div(class="subtle pin max-h-screen overflow-hidden h-screen fixed w-full bg-light-smoke z-max" @click.self="hideRowView" :class="{'pointer-events-auto opacity-100' : rowViewVisible, 'pointer-events-none opacity-0' : !rowViewVisible}" v-if="form && row")
        .absolute.pin-r.pin-b.pin-t.w-half.bg-white.shadow-lg
          .absolute.pin-t.pin-x.pin-r.border-t-8.border-formsid.z-max
          .bg-white.h-full.shadow.form-container.overflow-y-scroll.relative
            div.max-w-md.px-4.mx-auto.pb-12(style="margin-top: 5%;")
              div.w-full.mb-16
                div.py-3.px-8.subtle.bg-formsid-transparent(v-for="obj in form.objects" :key="obj.id")
                  div.flex.flex-col.mb-4(v-if="obj.data.type.indexOf('image') == -1")
                    p.break-words.greycliff.w-full.text-left.text-xl.leading-loose.mb-2.text-formsid-darkest(:content.sync="obj.data.title") {{ obj.data.title }}
                    input(type="text" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-glass focus:text-formsid-glass" v-if="['email', 'shortanswer'].indexOf(obj.data.type) > -1")
                    textarea(aria-label="Full name" class="subtle rounded focus:border-b-2 border-formsid-glass bg-formsid-clear appearance-none w-full p-3 leading-tight focus:outline-none outline-none greycliff text-xl font-light text-formsid-darker focus:text-formsid-glass resize-none" rows="3" v-autosize readonly :value="row.data.find(a => a.id == obj.id).answer" v-if="obj.data.type == 'paragraph'")
                    div(class="w-full greycliff bg-formsid-clear rounded text-center p-3 text-lg text-formsid-glass leading-tight tracking-normal subtle" v-if="['dropdown', 'multipleanswer', 'multiplechoice'].indexOf(obj.data.type) > -1") {{ row.data.find(a => a.id == obj.id).answer }}
</template>

<script lang="coffee">
import XLSX from 'xlsx'

export default
  name: 'Form',
  store: ['collections', 'forms', 'user']
  beforeRouteEnter: (to, from, next) ->
    next (vm) -> vm.form = (f for f in vm.collections.forms when f.id is to.params.id)[0]
  data: ->
    form: {}
    formData: []
    rowViewVisible: false
    selectedObjectId: null
  computed:
    answerable: -> o for o in @form.objects when o.data.type.indexOf('image') is -1 if @form?
    row: -> (s for s in @form.submissions when s._id is @selectedObjectId)[0] if @selectedObjectId?
    completionRate: ->
      return 0 unless @form.submissions?
      rates = []
      for s in @form.submissions
        answered = 0
        answers = s.data
        for q in @answerable
          answer = answers.find (a) -> a.id is q.id
          answered++ if answer? and answer.answer != ''
        rates.push (answered/@answerable.length) * 100
      Math.ceil((rates.reduce (p,c) -> p + c) / @form.submissions.length)
  methods:
    exportData: ->
      headers = @form.objects.filter(o) -> o.data.type isnt 'image'.map(a) -> a.data.title
      formData = []
      for s in newValue.submissions
        record = {}
        record[object.data.title] is (a for a in s.data when a.id is object.id)[0] for object in @answerable
        formData.push(record)
      ws = XLSX.utils.json_to_sheet(formData, { header: headers })
      wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet wb, ws, "Responses"
      XLSX.writeFile wb, "#{@form.title}.xlsx"
    timestamp: (time) ->
      new Intl.DateTimeFormat('default', {
        timeZone: 'UTC',
        weekday: 'short',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
      }).format(new Date(time))
    hideRowView: ->
      @rowViewVisible = false
    rowClicked: (id) ->
      @selectedObjectId = id
      @rowViewVisible = true
</script>
