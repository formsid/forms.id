import Vue from 'vue'
import Router from 'vue-router'

import FAQ from './FAQ.vue'
import Form from './Form.vue'
import Home from './Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FAQ,
    },
    {
      path: '/f/:uslug/:fslug',
      name: 'Form',
      component: Form,
    },
    {
      path: '*',
      redirect: '/'
    },
  ],
})
