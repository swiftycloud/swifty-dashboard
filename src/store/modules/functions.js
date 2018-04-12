import {
  SAVE_FUNCTIONS_LIST,
  SAVE_CURRENT_FUNCTION,
  SAVE_FUNCTION_LANGS,
  SAVE_FUNCTION_STATS
} from '../mutation-types'
import api from '@/api'

function transformToTestFunc (data) {
  data = JSON.parse(JSON.stringify(data))
  data.name = data.project.concat('_', data.name)
  data.project = 'test'

  return data
}

export default {
  state: {
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
    getFunctions: state => state.functions,
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
    fetchFunctions ({ state, commit }, { project, name }) {
      return api.functionList(project, name).then(response => {
        commit(SAVE_FUNCTIONS_LIST, response.data)
      })
    },
    fetchFunctionListInfo ({ state, getters, commit }, { project, periods }) {
      return api.functionListInfo(project, periods).then(response => {
        return response
      })
    },
    fetchFunctionInfo ({ state, getters, commit }, { project, name }) {
      return api.functionInfo(project, name).then(response => {
        if (project !== 'test') {
          commit(SAVE_CURRENT_FUNCTION, response.data)
        }
        return response
      })
    },
    fetchFunctionStats ({ state, getters, commit }, { project, name }) {
      return api.functionStats(project, name).then(response => {
        if (project !== 'test') {
          commit(SAVE_FUNCTION_STATS, response.data)
        }
        return response
      })
    },
    fetchTestFunctionInfo ({ dispatch }, data) {
      return dispatch('fetchFunctionInfo', transformToTestFunc(data))
    },

    fetchFunctionCode ({ state }, { project, name, version }) {
      return api.functionCode(project, name, version)
    },
    fetchFunctionLangs ({ commit }) {
      return api.infoLangs().then(response => {
        commit(SAVE_FUNCTION_LANGS, response.data)
      })
    },

    // waiting new verions
    waitFunction ({ state }, { project, name, timeout, version }) {
      return api.functionWait(project, name, timeout, version)
    },
    waitTestFunction ({ dispatch }, data) {
      return dispatch('waitFunction', transformToTestFunc(data))
    },

    // creating functions
    createFunction ({ commit, state }, data) {
      return api.functionAdd(data)
    },
    createTestFunction ({ dispatch }, data) {
      return dispatch('createFunction', transformToTestFunc(data))
    },

    // update functions
    updateFunction ({ commit, state }, data) {
      return api.functionUpdate(data)
    },
    updateTestFunction ({ dispatch }, data) {
      return dispatch('updateFunction', transformToTestFunc(data))
    },

    // enable function
    enableFunction ({ dispatch }, { project, name }) {
      return api.functionState(project, name, 'ready').then(response => {
        const data = transformToTestFunc({
          project: project,
          name: name
        })
        return api.functionState(data.project, data.name, 'ready')
      })
    },

    // disable function
    disableFunction ({ dispatch }, { project, name }) {
      return api.functionState(project, name, 'deactivated').then(response => {
        const data = transformToTestFunc({
          project: project,
          name: name
        })
        return api.functionState(data.project, data.name, 'deactivated')
      })
    },

    // running functions
    runFunction ({ commit, state }, { project, name, args }) {
      return api.functionRun(project, name, args)
    },
    runTestFunction ({ dispatch }, data) {
      return dispatch('runFunction', transformToTestFunc(data))
    },

    // removing functions
    removeFunction ({ state }, { project, name }) {
      return api.functionRemove(project, name).then(response => {
        const data = transformToTestFunc({
          project: project,
          name: name
        })
        return api.functionRemove(data.project, data.name)
      })
    }
  },

  mutations: {
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
