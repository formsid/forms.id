<template lang="pug">
  .container
    .flex.w-full
      div.bg-white.rounded.w-full.shadow
        .border-b
          .p-6.flex.justify-between.max-w-lg.mx-auto
            .text-center.flex.flex-col
              h4.mb-2 {{ form.submissions ? form.submissions.length : 0 }}
              span.text-light.text-uppercase Submissions
            .text-center.flex.flex-col
              h4.mb-2 0%
              span.text-light.text-uppercase Completion Rate
            .text-center.flex.flex-col
              h4.mb-2 {{ form.views }}
              span.text-light.text-uppercase Views
        table.w-full
          thead
            tr
              th.py-4(scope="col") #
              th.py-4(scope="col") Data
              th.py-4(scope="col") Timestamp
          tbody
            tr.hover-bg-pale-khaki.cursor-pointer(v-for="(record, i) in form.submissions" :key="record._id")
              td {{ i + 1 }}
              td {{ filled(record.data) }}
              td {{ timestamp(record.created) }}
</template>

<script lang="coffee">
import XLSX from 'xlsx'
isDev = process.env.NODE_ENV is 'development'

export default
  name: 'Form',
  store: ['collections', 'forms', 'user']
  beforeRouteEnter: (to, from, next) ->
    next (vm) -> vm.form = vm.collections.forms.find(f) -> f.id is to.params.id
  data: ->
    form: {}
    formData: []
  computed:
    formPreview: ->
      "#{isDev ? 'http://localhost:8081' : 'https://forms.id'}/f/#{@user.username}/#{@form.id}"
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
      max = @form.objects.filter(o) -> o.data.type isnt 'image'.length
      "#{(data.length / max) * 100}% filled"
  watch:
    form: (newValue, oldValue) ->
      if newValue
        answerable = newValue.objects.filter(o) -> o.data.type isnt 'image'
        data = []
        newValue.submissions.forEach(s) ->
          record = {}
          answerable.map(a => a.id).forEach(object) ->
            record[newValue.objects.find(o) -> o.id == object.data.title] is s.data[object]
          data.push(record)
        @formData = data
</script>
