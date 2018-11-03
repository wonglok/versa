// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCodemirror from 'vue-codemirror'

import 'normalize.css'
import 'codemirror/lib/codemirror.css'
import './assets/css/CodeMirror.css'
import './assets/css/skeleton.css'
import './assets/css/wide.css'

Vue.config.productionTip = false
Vue.use(VueCodemirror)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
