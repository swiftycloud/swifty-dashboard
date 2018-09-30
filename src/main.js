/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueMoment from 'vue-moment'
import VueFilterPrettyBytes from 'vue-filter-pretty-bytes'
import moment from 'moment-timezone'

import App from '@/App'
import store from '@/store'
import router from '@/router'

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import 'codemirror/theme/solarized.css'
import '@/assets/scss/vendors.scss'
import '@/assets/scss/swifty.scss'

import ElTreeGrid from 'element-tree-grid'
Vue.component(ElTreeGrid.name, ElTreeGrid)

router.beforeEach((to, from, next) => {
  store.dispatch('userIsAuth').then(isAuth => {
    if (isAuth === true) {
      return to.name !== 'sign' ? next() : next(false)
    } else {
      sessionStorage.setItem('history.back', to.path)
      return to.name === 'sign' ? next() : next('/sign')
    }
  })
})

router.afterEach((to, from) => {
  sessionStorage.setItem('history.back', from.path)
})

store.dispatch('initUserAuth', router)

Vue.use(ElementUI, { locale })
Vue.use(VueMoment, { moment })
Vue.use(VueFilterPrettyBytes)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
