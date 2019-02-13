<template>
  <d-container fluid class="main-content-container px-4">

    <!-- <d-row>
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <bo-users-overview :chartdata="chartData"/>
      </d-col>
    </d-row> -->
  </d-container>
</template>

<script>
import moment from 'moment'


export default {
  store: ['collections'],
  components: {
    SmallStats,
    boUsersOverview: FormsOverview,
  },
  data() {
    return {
      chartData: {}
    }
  },
  computed: {
    forms() {
      return this.collections.forms
    }
  },
  methods: {
    handleApprove(id) {
      alert(`Approving discussion id: ${id}`)
    },
    handleReject(id) {
      alert(`Rejecting discussion id: ${id}`)
    },
    handleEdit(id) {
      alert(`Editing discussion id: ${id}`)
    },
    handleViewAllComments() {
      alert('Viewing all comments!')
    }
  },
  computed: {
    forms(){
      return this.collections.forms
    },
    smallStats() {
      let formDays = []
      formDays.push(this.forms.filter(f => {
        return moment(f.createdAt).isSame(moment(new Date()), 'day')
      }).length)
      for (let i = 1; i < 7; i++) {
        formDays.push(this.forms.filter(f => moment(f.createdAt).isSame(moment(new Date()).subtract(i, 'day'), 'day')).length)
      }
      console.log(formDays)
      return [{
        label: 'Forms',
        value: this.forms.length,
        percentage: '',
        increase: false,
        decrease: false,
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(48,70,152,.22)',
          borderColor: 'rgb(48,70,152)',
          data: formDays.reverse(),
        }],
      }, {
        label: 'Submissions',
        value: this.forms.map(f => f.submissions.length).reduce((a, b) => a + b, 0),
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
        value: this.forms.map(f => f.views).reduce((a, b) => a + b, 0),
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
  watch: {
    forms(newValue, oldValue) {
      // this.generateChartData()
    }
  },
};
</script>

