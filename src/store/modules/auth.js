/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import api from '@/api'
import {
  SAVE_USER_INFO,
  SAVE_AUTH_TOKEN,
  SAVE_USER_ID,
  RESET_AUTH_DATA
} from '@/store/mutation-types.js'

export default {
  state: {
    user: {
      id: null,
      name: null,
      created: null
    },
    token: null,
    expires: null
  },

  getters: {
    getUserInfo: state => state.user,
    getToken: state => state.token
  },

  actions: {
    initUserAuth ({ commit, dispatch }, router) {
      const userId = localStorage.getItem('_id')
      const token = localStorage.getItem('_token')
      const expires = localStorage.getItem('_expires')

      if (userId !== null && token !== null && expires !== null) {
        commit(SAVE_USER_ID, userId)
        commit(SAVE_AUTH_TOKEN, { token: token, expires: expires })

        /** Setting up axios **/
        api.axios.interceptors.response.use(response => {
          return response
        }, error => {
          if (error.response.status === 401) {
            dispatch('userLogout', router)
          } else {
            console.warn('API:', error.response.data)
            return Promise.reject(error)
          }
        })

        api.axios.defaults.headers.common['X-Auth-Token'] = token

        /** Get user info **/
        api.userInfo(userId).then(response => {
          commit(SAVE_USER_INFO, response.data)
        })

        /** Fetch projects list **/
        dispatch('fetchProjects')
      }

      setTimeout(() => {
        dispatch('setAppLoadingStatus', false)
      }, 1000)
    },

    userIsAuth ({ state }) {
      if (state.user.id === null || state.token === null || state.expires === null) {
        return false
      }

      return (new Date(state.expires) > new Date())
    },

    userSignIn ({ dispatch }, { email, password, router }) {
      return api.userLogin(email, password).then(response => {
        if (response.status === 200) {
          return dispatch('saveAuthToken', {
            token: response.headers['x-subject-token'],
            expires: response.data.expires
          })
        } else {
          return Promise.reject(new Error('Sign in was failed'))
        }
      }).then(() => {
        return dispatch('saveUserId', email)
      }).then(() => {
        return dispatch('initUserAuth', router)
      })
    },

    userSignUp ({ dispatch }, { email, password, name, router }) {
      return api.requestApiToken().then(response => {
        return api.userCreate(email, password, name, response.headers['x-subject-token'])
      }).then(response => {
        if (response.status === 201) {
          return dispatch('userSignIn', {
            email: email,
            password: password,
            Router: router
          })
        } else {
          return Promise.reject(new Error('Sign up was failed'))
        }
      })
    },

    userLogout ({ commit }, router) {
      localStorage.clear()
      commit(RESET_AUTH_DATA)
      router.push({ path: '/sign' })
    },

    saveAuthToken ({ commit }, { token, expires }) {
      localStorage.setItem('_token', token)
      localStorage.setItem('_expires', expires)
      commit(SAVE_AUTH_TOKEN, { token: token, expires: expires })
    },

    saveUserId ({ commit }, id) {
      localStorage.setItem('_id', id)
      commit(SAVE_USER_ID, id)
    }
  },

  mutations: {
    [SAVE_USER_INFO] (state, user) {
      state.user.id = user.id
      state.user.name = user.name
      state.user.created = user.created
    },
    [SAVE_AUTH_TOKEN] (state, payload) {
      state.token = payload.token
      state.expires = payload.expires
    },
    [SAVE_USER_ID] (state, id) {
      state.user.id = id
    },
    [RESET_AUTH_DATA] (state) {
      state.user.id = null
      state.token = null
      state.expires = null
    }
  }
}
