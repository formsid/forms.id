import Vue from 'vue'
import Router from 'vue-router'

import Dash from './views/Dash.vue'
import NewForms from './views/NewForms.vue'
import NewForm from './views/NewForm.vue'

import Errors from './views/Errors.vue'
import Forms from './views/Forms.vue'
import Form from './views/Form.vue'
import FormEditor from './views/FormEditor.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/ui',
      component: Dash,
      name: 'Dashboard',
      children: [
        {
          path: 'forms',
          component: NewForms,
          name: 'Forms'
        },
        {
          path: 'forms/:id',
          name: 'Form',
          component: NewForm,
        },
        {
          path: 'polls',
          component: NewForms,
          name: 'Polls'
        },
      ]
    },
    // {
    //   path: '/',
    //   redirect: '/forms',
    // },
    // {
    //   path: '/404',
    //   name: '404',
    //   component: Errors,
    // },
    // {
    //   path: '/forms',
    //   name: 'Forms',
    //   component: Forms,
    // },
    // {
    //   path: '/forms/new',
    //   name: 'NewForm',
    //   component: FormEditor,
    // },
    // {
    //   path: '/forms/:id',
    //   name: 'Form',
    //   component: Form,
    // },
    // {
    //   path: '/forms/:id/edit',
    //   name: 'EditForm',
    //   component: FormEditor,
    // },
    {
      path: '*',
      redirect: '/404',
    },
  ],
})
