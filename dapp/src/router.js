import Vue from 'vue'
import Router from 'vue-router'

import Errors from './views/Errors.vue'
import Forms from './views/Forms.vue'
import Form from './views/Form.vue'
import FormEditor from './views/FormEditor.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/forms',
    },
    {
      path: '/404',
      name: '404',
      component: Errors,
    },
    {
      path: '/forms',
      name: 'Forms',
      component: Forms,
    },
    {
      path: '/forms/new',
      name: 'NewForm',
      component: FormEditor,
    },
    {
      path: '/forms/:id',
      name: 'Form',
      component: Form,
    },
    {
      path: '/forms/:id/edit',
      name: 'EditForm',
      component: FormEditor,
    },
    {
      path: '*',
      redirect: '/404',
    },
  ],
})
