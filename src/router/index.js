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
      component: require('@/components/HelloWorld').default
    },
    {
      path: '/versa',
      name: 'Versa',
      component: require('@/components/pages/Versa/Versa.vue').default
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
