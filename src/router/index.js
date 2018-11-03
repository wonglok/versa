import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
// import Editor from '@/components/pages/Editor/Editor.vue'
import Versa from '@/components/pages/Versa/Versa.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/versa',
      name: 'Versa',
      component: Versa
    },
    {
      path: '/editor',
      redirect: '/versa'
    }
  ]
})
