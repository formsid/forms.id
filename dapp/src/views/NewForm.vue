<template lang="pug">
  .container
    .flex.w-full
      div.bg-white.rounded.w-full.shadow
        .border-b
          .p-6.flex.justify-between.max-w-lg.mx-auto
            .text-center.flex.flex-col
              h4.mb-2.font-light.text-2xl.text-formsid-darkest {{ form.submissions ? form.submissions.length : 0 }}
              span.font-light.text-uppercase.text-formsid-darker Submissions
            .text-center.flex.flex-col
              h4.mb-2.font-light.text-2xl.text-formsid-darkest 0%
              span.font-light.text-uppercase.text-formsid-darker Completion Rate
            .text-center.flex.flex-col
              h4.mb-2.font-light.text-2xl.text-formsid-darkest {{ form.views }}
              span.font-light.text-uppercase.text-formsid-darker Views
        table.w-full
          thead
            tr
              th.py-4.font-light.text-formsid-darkest(scope="col") #
              th.py-4.font-light.text-formsid-darkest(scope="col") Data
              th.py-4.font-light.text-formsid-darkest(scope="col") Timestamp
          tbody(v-if="form.submissions && form.submissions.length")
            tr.hover-bg-pale-khaki.cursor-pointer(v-for="(record, i) in form.submissions" :key="record._id")
              td {{ i + 1 }}
              td {{ filled(record.data) }}
              td {{ timestamp(record.created) }}
        p.py-4.text-center.font-light.text-formsid-darker.border-t No submissions, yet.
</template>

<script lang="coffee">
import XLSX from 'xlsx'

export default
  name: 'Form',
  store: ['collections', 'forms', 'user']
  beforeRouteEnter: (to, from, next) ->
    next (vm) ->
       vm.form = (f for f in vm.collections.forms when f.id is to.params.id)[0]
  data: ->
    form: {}
    formData: []
  methods:
    exportData: ->
      headers = @form.objects.filter(o) -> o.data.type isnt 'image'.map(a) -> a.data.title
      ws = XLSX.utils.json_to_sheet(@formData, { header: headers })
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
    filled: (data) ->
      max = (o for o in @form.objects when o.data.type isnt 'image').length
      "#{(data.length / max) * 100}% filled"
  watch:
    form: (newValue, oldValue) ->
      if newValue
        answerable = o for o in newValue.objects when o.data.type isnt 'image'
        data = []
        for s in newValue.submissions
          record = {}
          aids = a.id for a in answerable
          for object in aids
            titleCheck = (o for o in newValue.objects when o.id is object.data.title)[0]
            record[newValue.objects.find(o) -> o.id == object.data.title] is s.data[object]
          data.push(record)
        @formData = data
</script>
