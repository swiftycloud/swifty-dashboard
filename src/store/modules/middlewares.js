import {
  SAVE_MIDDLEWARES,
  SAVE_MIDDLEWARE_TYPES
} from '../mutation-types'
import api from '@/api'

export default {
  state: {
    middlewares: [],
    types: [],
    typeNames: {
      maria: 'MariaDB',
      s3: 'Object Storage',
      mongo: 'MongoDB',
      authjwt: 'Auth Database'
    }
  },

  getters: {
    getMiddlewares: state => state.middlewares,
    getMiddlewaresByType: state => type => state.middlewares.filter(item => item.type === type),
    getMiddlewareTypes: (state) => {
      var types = []
      state.types.forEach((v, k) => {
        if (v in state.typeNames) {
          types.push({
            id: v,
            name: state.typeNames[v]
          })
        }
      })

      return types
    },
    findMwareByID: state => id => state.middlewares.find(item => item === id)
  },

  actions: {
    fetchMiddlewareList ({ commit }, project) {
      return api.middlewareList(project).then(response => {
        if (response.data !== null) {
          commit(SAVE_MIDDLEWARES, response.data)
        } else {
          commit(SAVE_MIDDLEWARES, [])
        }
      })
    },
    fetchMiddlewareListInfo ({ commit }, project) {
      return api.middlewareListInfo(project)
    },
    fetchMiddlewareTypes ({ commit }) {
      return api.infoMiddlewares().then(response => {
        commit(SAVE_MIDDLEWARE_TYPES, response.data)
      })
    },
    addMiddleware ({ commit }, { project, id, type }) {
      return api.middlewareAdd(project, id, type)
    },
    removeMiddleware ({ commit }, { project, id }) {
      return api.middlewareRemove(project, id)
    }
  },

  mutations: {
    [SAVE_MIDDLEWARES] (state, data) {
      state.middlewares = data
    },
    [SAVE_MIDDLEWARE_TYPES] (state, data) {
      state.types = data
    }
  }
}
