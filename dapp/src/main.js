require('setimmediate')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import notifications from 'vue-notification'
import stash from 'vue-stash'
import { Tree } from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css';
import Editable from '@/components/Editable.vue'

Vue.component('editable', Editable)
Vue.component('tree', Tree)
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
