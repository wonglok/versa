import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from ''
// import Editor from '@/components/pages/Editor/Editor.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: () => import('@/components/HelloWorld')
    },
    {
      path: '/versa',
      name: 'Versa',
      component: () => import('@/components/pages/Versa/Versa.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/components/pages/About/About.vue')
    },
    {
      path: '/editor',
      redirect: '/versa'
    }
  ]
})
