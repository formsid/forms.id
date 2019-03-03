require('setimmediate')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import autosize from 'vue-autosize'
import notifications from 'vue-notification'
import stash from 'vue-stash'
import tooltip from 'v-tooltip'
import { Collapse, CollapseItem } from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css';
import Editable from '@/components/Editable.vue'

Vue.component('editable', Editable)
Vue.component('collapse', Collapse)
Vue.component('collapse-item', CollapseItem)
Vue.use(autosize)
Vue.use(notifications)
Vue.use(stash)
Vue.use(tooltip)
Vue.config.productionTip = false

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
