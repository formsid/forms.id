require('setimmediate')
/* eslint-disable */
import Vue from 'vue'
import ShardsVue from 'shards-vue'
import notifications from 'vue-notification'
import stash from 'vue-stash'

import 'bootstrap/dist/css/bootstrap.css'
import '@/scss/shards-dashboards.scss'
import '@/assets/scss/date-range.scss'

// Core
import App from './App.vue'
import router from './router'

// Layouts
import Default from '@/layouts/Default.vue'
import Editable from '@/components/Editable.vue'
ShardsVue.install(Vue)

Vue.component('default-layout', Default)
Vue.component('editable', Editable)
Vue.use(notifications)
Vue.use(stash)
Vue.config.productionTip = false
Vue.prototype.$eventHub = new Vue()

window.blockstack = require('blockstack')
window.uuid = ((a, b) => {
  for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
  return b.replace(/-/g, "").slice(0,10)
})

new Vue({
  router,
  data: () => ({
    store: {
      bus: new Vue(),
      collections: {
        forms: []
      },
      forms: [],
      user: false
    },
  }),
  render: h => h(App),
}).$mount('#app')
