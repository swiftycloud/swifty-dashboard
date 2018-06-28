/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'

import sidebar from './modules/sidebar'
import page from './modules/page'
import functions from './modules/functions'
import s3 from './modules/s3'
import auth from './modules/auth'
import projects from './modules/projects'
import templates from './modules/templates'
import middlewares from './modules/middlewares'
import stats from './modules/stats'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  modules: {
    sidebar,
    page,
    functions,
    s3,
    auth,
    projects,
    templates,
    middlewares,
    stats
  }
})
