/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

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
      mongo: 'MongoDB'
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
    fetchMiddlewareList ({ commit }, data) {
      return api.middleware.get(data).then(response => {
        if (response.data !== null) {
          commit(SAVE_MIDDLEWARES, response.data)
        } else {
          commit(SAVE_MIDDLEWARES, [])
        }

        return response
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
      return api.middleware.create({
        project: project,
        name: id,
        type: type
      })
    },
    removeMiddleware ({ commit }, { project, id }) {
      return api.middleware.delete(id)
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
