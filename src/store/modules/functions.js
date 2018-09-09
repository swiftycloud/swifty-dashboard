/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import {
  SAVE_FUNCTION,
  SAVE_FUNCTION_SOURCES,
  SAVE_FUNCTIONS_LIST,
  SAVE_CURRENT_FUNCTION,
  SAVE_FUNCTION_LANGS,
  SAVE_FUNCTION_STATS
} from '../mutation-types'
import api from '@/api'

export default {
  state: {
    function: {},
    functionSources: {},
    functions: [],
    currentFunction: {
      mware: [],
      s3buckets: [],
      version: null
    },
    functionStats: null,
    languages: []
  },

  getters: {
    function: state => state.function,
    functions: state => state.functions,
    getFunctions: state => state.functions,
    getFunctionID: state => state.currentFunction.id,
    getCurrentFunctionVersion: state => state.currentFunction.version,
    getFunctionLangs: state => state.languages,
    getFunctionMwares: state => state.currentFunction.mware,
    getFunctionBuckets: state => state.currentFunction.s3buckets,
    getFunctionMwaresAndBuckets: state => {
      var list = []
      if (state.currentFunction !== null) {
        state.currentFunction.mware.forEach((v, k) => {
          list.push({
            id: v,
            type: 'unknown'
          })
        })

        state.currentFunction.s3buckets.forEach((v, k) => {
          list.push({
            id: v,
            type: 's3'
          })
        })
      }

      return list
    }
  },

  actions: {
    fetchFunctions ({ getters, commit }) {
      return api.functions.get({
        project: getters.project,
        details: true
      }).then(response => {
        commit(SAVE_FUNCTIONS_LIST, response.data)
        return response.data
      })
    },

    getFunctionByID ({ commit }, fid) {
      return api.functions.find(fid)
    },

    fetchFunctionByID ({ commit, dispatch }, fid) {
      return dispatch('getFunctionByID', fid).then(response => {
        commit(SAVE_FUNCTION, response.data)
        return response
      })
    },

    /** Update Function **/
    updateFunction ({ commit, state }, { fid, data }) {
      return api.functions.update(fid, data)
    },

    /** Function Sources **/

    fetchFunctionSourcesByID ({ commit }, fid) {
      return api.functions.one(fid).sources.get().then(response => {
        commit(SAVE_FUNCTION_SOURCES, response.data)
        return response
      })
    },

    updateFunctionSources ({ commit }, { fid, data }) {
      return api.functions.one(fid).sources.update(null, data)
    },

    /** Run Function **/

    runFunctionCode ({ commit }, { fid, data }) {
      return api.functions.one(fid).run(data)
    },

    waitFunctionVersion ({ commit }, { fid, data }) {
      return api.functions.one(fid).wait(data)
    },

    /** Delete Function **/

    deleteFunctionByID ({ state }, fid) {
      return api.functions.delete(fid)
    },

    /** Change Function State **/
    disableFunctionByID ({ state }, fid) {
      api.functions.one(fid).state.update(null, '"deactivated"')
    },

    enableFunctionByID ({ state }, fid) {
      api.functions.one(fid).state.update(null, '"ready"')
    },

    // ** OLD ** //

    fetchFunctionListInfo ({ state, getters, commit }, { project, periods }) {
      return api.functionListInfo(project, periods).then(response => {
        return response
      })
    },

    fetchFunctionInfo ({ state, getters, commit }, { project, name }) {
      return api.functionInfo(project, name).then(response => {
        commit(SAVE_CURRENT_FUNCTION, response.data)
        return response
      })
    },

    fetchFunctionStats ({ state, getters, commit }, { project, name }) {
      return api.functionStats(project, name).then(response => {
        commit(SAVE_FUNCTION_STATS, response.data)
        return response
      })
    },

    fetchFunctionCode ({ state }, { project, name, version }) {
      return api.functionCode(project, name, version)
    },
    fetchFunctionLangs ({ commit }) {
      return api.infoLangs().then(response => {
        commit(SAVE_FUNCTION_LANGS, response.data)
      })
    },

    // creating functions
    createFunction ({ commit, state }, data) {
      return api.functions.create(data)
    },

    // enable function
    enableFunction ({ dispatch }, { project, name }) {
      return api.functionState(project, name, 'ready')
    },

    // disable function
    disableFunction ({ dispatch }, { project, name }) {
      return api.functionState(project, name, 'deactivated')
    }
  },

  mutations: {
    [SAVE_FUNCTION] (state, data) {
      state.function = data
    },
    [SAVE_FUNCTION_SOURCES] (state, data) {
      state.functionSources = data
    },
    [SAVE_FUNCTIONS_LIST] (state, data) {
      state.functions = data
    },
    [SAVE_CURRENT_FUNCTION] (state, data) {
      state.currentFunction = data
    },
    [SAVE_FUNCTION_STATS] (state, data) {
      state.functionStats = data
    },
    [SAVE_FUNCTION_LANGS] (state, langs) {
      state.languages = langs
    }
  }
}
