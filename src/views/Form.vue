<template>
  <d-container fluid class="main-content-container px-4">
    <!-- Page Header -->


    <d-row no-gutters class="page-header py-4 flex justify-between items-center">
      <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
        <h3 class="page-title">{{ form.title }}</h3>
      </d-col>
      <div class="flex-grow flex justify-end">
        <div class="d-flex">
          <d-button class="btn-outline-accent text-sm mr-3">
            <i class="material-icons">cloud_download</i> Download Data
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
              <h4 class="mt-0 mb-1">{{ submissions.length }}</h4><span class="text-light text-uppercase">Submissions</span>
            </div>
            <div class="text-center col-sm-4 col-md-6 col-lg-4">
              <h4 class="mt-0 mb-1">72.4%</h4><span class="text-light text-uppercase">Completion Rate</span>
            </div>
            <div class="text-center col-sm-4 col-md-6 col-lg-4">
              <h4 class="mt-0 mb-1">400</h4><span class="text-light text-uppercase">Views</span>
            </div>
          </div>
          <div class="card-body p-0 pb-3 text-center">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">#</th>
                  <th scope="col" class="border-0">First Name</th>
                  <th scope="col" class="border-0">Last Name</th>
                  <th scope="col" class="border-0">Country</th>
                  <th scope="col" class="border-0">City</th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover:bg-pale-khaki cursor-pointer" v-for="(record, i) in submissions" :key="record.id">
                  <td>{{ i + 1 }}</td>
                  <td>Ali</td>
                  <td>Kerry</td>
                  <td>Russian Federation</td>
                  <td>Gdańsk</td>
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

export default {
  name: 'Form',
  store: ['collections', 'forms'],
  beforeRouteEnter(to, from, next){
    next(vm => {
      vm.form = vm.collections.forms.find(f => f.id == to.params.id)
    })
  },
  data() {
    return {
      form: {},
      submissions: []
    }
  },
  computed: {

  },
  methods: {
    fetchSubmissions() {
      let items = []
      for (let i = 0; i < 23; i++) {
        items.push({ id: i, created: Date.now()})
      }
      this.submissions = items
    }
  },
  mounted(){
    this.fetchSubmissions()
  }
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
