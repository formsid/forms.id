import Vue from 'vue'
import Router from 'vue-router'

import Dash from './views/Dash.vue'
import Forms from './views/Forms.vue'
import Form from './views/Form.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      component: Dash,
      name: 'Dashboard',
      children: [
        {
          path: 'forms',
          component: Forms,
          name: 'Forms'
        },
        {
          path: 'forms/:id',
          name: 'Form',
          component: Form,
        },
        // {
        //   path: 'polls',
        //   component: Polls,
        //   name: 'Polls'
        // },
      ]
    },
    {
      path: '*',
      redirect: '/forms',
    }
  ],
})
