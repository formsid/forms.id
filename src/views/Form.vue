<template>
  <d-container fluid class="main-content-container px-4">
    <d-row no-gutters class="page-header py-4 flex justify-between items-center">
      <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
        <h3 class="page-title">{{ form.title }}</h3>
      </d-col>
      <div class="flex-grow flex justify-end">
        <div class="d-flex">
          <a class="block no-underline" :href="formPreview" target="_blank">
            <d-button class="btn-outline-accent text-sm mr-3" v-if="form.public">
              <i class="material-icons">remove_red_eye</i> View
            </d-button>
          </a>
          <d-button class="btn-outline-accent text-sm mr-3" @click="exportData">
            <i class="material-icons">cloud_download</i> Export Data
          </d-button>
          <router-link :to="`/forms/${form.id}/edit`" class="block no-underline">
             <d-button class="btn-accent text-sm">
              <i class="material-icons">edit</i> Edit
            </d-button>
          </router-link>
        </div>
      </div>
    </d-row>
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="row py-4 border-bottom">
            <div class="text-center col-sm-4 col-md-6 col-lg-4">
              <h4 class="mt-0 mb-1">{{ form.submissions ? form.submissions.length : 0 }}</h4><span class="text-light text-uppercase">Submissions</span>
            </div>
            <div class="text-center col-sm-4 col-md-6 col-lg-4">
              <h4 class="mt-0 mb-1">0%</h4><span class="text-light text-uppercase">Completion Rate</span>
            </div>
            <div class="text-center col-sm-4 col-md-6 col-lg-4">
              <h4 class="mt-0 mb-1">{{ form.views }}</h4><span class="text-light text-uppercase">Views</span>
            </div>
          </div>
          <div class="card-body p-0 pb-3 text-center">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">#</th>
                  <th scope="col" class="border-0">Data</th>
                  <th scope="col" class="border-0">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover:bg-pale-khaki cursor-pointer" v-for="(record, i) in form.submissions" :key="record._id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ record.data }}</td>
                  <td>{{ timestamp(record.created) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </d-container>
</template>

<script>
import XLSX from 'xlsx'
const isDev = process.env.NODE_ENV == 'development'

export default {
  name: 'Form',
  store: ['collections', 'forms', 'user'],
  beforeRouteEnter(to, from, next){
    next(vm => {
      vm.form = vm.collections.forms.find(f => f.id == to.params.id)
    })
  },
  data() {
    return {
      form: {},
      formData: []
    }
  },
  computed: {
    formPreview(){
      return `${isDev ? 'http://localhost:8081' : 'https://forms.id'}/f/${this.user.username}/${this.form.id}`
    }
  },
  methods: {
    exportData(){
      const ws = XLSX.utils.json_to_sheet(this.formData, { header: this.form.objects.filter(o => o.data.type !== 'image').map(a => a.data.title) })
			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, "Responses")
			XLSX.writeFile(wb, `${this.form.title}.xlsx`)
    },
    timestamp(time){
      return new Intl.DateTimeFormat('default', {
        timeZone: 'UTC',
        weekday: 'short',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
      }).format(new Date(time))
    }
  },
  mounted(){

  },
  watch: {
    form(newValue, oldValue) {
      if(newValue){
        const answerable = newValue.objects.filter(o => o.data.type !== 'image')
        let data = []
        newValue.submissions.forEach(s => {
          let record = {}
          answerable.map(a => a.id).forEach(object => {
            record[newValue.objects.find(o => o.id == object).data.title] = s.data[object]
          })
          data.push(record)
        })
        this.formData = data
      }
    }
  },
}
</script>

<style scoped>
.card-link {
  color: inherit !important;
  text-decoration: none !important;
}
.card-title {
  font-weight: 400;
}
</style>
