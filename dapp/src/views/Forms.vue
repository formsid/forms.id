<template>
  <d-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4 flex justify-between items-center">
      <d-col col sm="6" class="text-center text-sm-left mb-4 mb-sm-0">
        <h3 class="page-title">Forms</h3>
      </d-col>
      <div class="flex-grow flex justify-end">
        <div class="d-flex">
          <router-link :to="`/forms/new`" class="block no-underline">
            <d-button class="btn-accent text-sm">
              <i class="material-icons">create</i> Create
            </d-button>
          </router-link>
        </div>
      </div>
    </d-row>
    <d-row>
      <d-col lg v-for="(stats, idx) in smallStats" :key="idx" class="mb-4">
        <small-stats :id="`small-stats-${idx}`" variation="1" :chart-data="stats.datasets" :label="stats.label" :value="stats.value" :percentage="stats.percentage" :increase="stats.increase" :decrease="stats.decrease" />
      </d-col>
    </d-row>
    <d-row>
      <d-col v-for="form in sortedForms" :key="form.id" lg="4">
        <d-card class="card-small card-post mb-4 cursor-pointer">
          <router-link :to="`/forms/${form.id}`" class="card-link block no-underline">
            <d-card-body>
              <h5 class="card-title">{{ form.title }}</h5>
            </d-card-body>
          </router-link>
          <d-card-footer class="border-top d-flex">
            <div class="card-post__author d-flex">
              <div class="d-flex flex-column justify-content-center">
                <span class="card-post__author-name">{{ form.submissions.length }} Responses</span>
              </div>
            </div>
            <div class="my-auto ml-auto">
              <d-button size="sm" class="ml-2 btn-white" @click="clickDeleteForm(form.id)">
                <i class="far fa-trash-alt"></i>
              </d-button>
            </div>
          </d-card-footer>
        </d-card>
      </d-col>
    </d-row>
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

  </d-container>
</template>

<script>
import SmallStats from '@/components/dash/SmallStats'

export default {
  store: ['bus', 'collections', 'forms'],
  components: { SmallStats },
  data() {
    return {
      deleteAttempt: null,
      showDeleteModal: false,
      isDeletingForm: false,
    }
  },
  computed: {
    sortedForms(){
      return this.collections.forms
    },
    deletingForm(){
      return this.deleteAttempt ? this.sortedForms.find(f => f.id == this.deleteAttempt) : false
    },
    smallStats() {
      return [{
        label: 'Forms',
        value: this.sortedForms.length,
        percentage: '',
        increase: false,
        decrease: false,
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(48,70,152,.22)',
          borderColor: 'rgb(48,70,152)',
          data: [1, 2, 3, 3, 3, 4, 4],
        }],
      }, {
        label: 'Responses',
        value: this.sortedForms.map(f => f.submissions.length).reduce((a, b) => a + b, 0),
        percentage: '12.4%',
        increase: true,
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(48,70,152,.22)',
          borderColor: 'rgb(48,70,152)',
          data: [1, 2, 3, 3, 3, 4, 4],
        }],
      }, {
        label: 'Views',
        value: this.sortedForms.map(f => f.views).reduce((a, b) => a + b, 0),
        percentage: '3.8%',
        increase: false,
        decrease: true,
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(48,70,152,.22)',
          borderColor: 'rgb(48,70,152)',
          data: [2, 3, 3, 3, 4, 3, 3],
        }],
      }];
    },
  },
  methods: {
    clickDeleteForm(id){
      this.deleteAttempt = id
      this.showDeleteModal = true
    },
    deleteForm(id) {
      return new Promise(async (resolve, reject) => {
        this.isDeletingForm = true
        if(this.deletingForm.public){
          await blockstack.putFile(`shared/${id}.json`, JSON.stringify(null))
        }
        await blockstack.putFile(`forms/${id}.json`, JSON.stringify(null))
        this.forms = this.forms.filter(f => f !== id)
        this.collections.forms = this.collections.forms.filter(f => f.id !== id)
        await blockstack.putFile(`forms.json`, JSON.stringify(this.forms), { encrypt : true })
        this.isDeletingForm = false
        this.deleteModalClosed()
        this.$notify({
          group: 'topcent',
          text: 'Form deleted successfully.'
        })
        this.bus.$emit('updateforms')
        resolve()
      })
    },
    deleteModalClosed(){
      if(!this.isDeletingForm){
        this.showDeleteModal = false
        this.deleteAttempt = null
      }
    }
  },
  mounted(){

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
