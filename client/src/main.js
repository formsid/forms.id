require('setimmediate')

import Vue from 'vue'
import App from './App'
import notifications from 'vue-notification'
import router from './router'
import sprogbar from 'vue-scroll-progressbar'

Vue.use(notifications)
Vue.use(router)

window.uuid = ((a, b) => {
  for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
  return b.replace(/-/g, "").slice(0,10)
})

Vue.component("vue-scroll-progress-bar", sprogbar)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
