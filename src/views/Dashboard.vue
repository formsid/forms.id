<template>
  <d-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4">
      <d-col col sm="4" class="text-center text-sm-left mb-4 mb-sm-0">
        <h3 class="page-title">Dashboard</h3>
      </d-col>
    </d-row>

    <!-- Small Stats Blocks -->
    <d-row>
      <d-col lg v-for="(stats, idx) in smallStats" :key="idx" class="mb-4">
        <small-stats :id="`small-stats-${idx}`" variation="1" :chart-data="stats.datasets" :label="stats.label" :value="stats.value" :percentage="stats.percentage" :increase="stats.increase" :decrease="stats.decrease" />
      </d-col>
    </d-row>

    <d-row>
      <!-- Users Overview -->
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <bo-users-overview />
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
import SmallStats from '@/components/dash/SmallStats.vue';
import FormsOverview from '@/components/dash/FormsOverview.vue'

export default {
  store: ['collections'],
  components: {
    SmallStats,
    boUsersOverview: FormsOverview,
  },
  data() {
    return {
      dateRange: {
        from: null,
        to: null,
      },
    };
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
    },
  },
  computed: {
    forms(){
      return this.collections.forms
    },
    smallStats() {
      return [{
        label: 'Forms',
        value: this.forms.length,
        percentage: '',
        increase: false,
        decrease: false,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(48,70,152,.22)',
          borderColor: 'rgb(48,70,152)',
          data: [1, 2, 1, 3, 5, 4, 7],
        }],
      }, {
        label: 'Submissions',
        value: 0,
        percentage: '12.4%',
        increase: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
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
        value: 0,
        percentage: '3.8%',
        increase: false,
        decrease: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
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
};
</script>

