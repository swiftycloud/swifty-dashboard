/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import api from '@/api'
import config from '@/api/config'
import { Model } from 'vue-api-query'
import {
  SAVE_USER_INFO,
  SAVE_AUTH_TOKEN,
  SAVE_USER_ID,
  RESET_AUTH_DATA,
  SAVE_LOGIN_AS_STATUS
} from '@/store/mutation-types.js'

function getCookie (name) {
  var matches = document.cookie.match(new RegExp(
    '(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ))
  return matches ? decodeURIComponent(matches[1]) : undefined
}

function setCookie (name, value, options) {
  options = options || {}

  var expires = options.expires

  if (typeof expires === 'number' && expires) {
    var d = new Date()
    d.setTime(d.getTime() + expires * 1000)
    expires = options.expires = d
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString()
  }

  value = encodeURIComponent(value)

  var updatedCookie = name + '=' + value

  for (var propName in options) {
    updatedCookie += '; ' + propName
    var propValue = options[propName]
    if (propValue !== true) {
      updatedCookie += '=' + propValue
    }
  }

  document.cookie = updatedCookie
}

export default {
  state: {
    user: {
      id: null,
      uid: null,
      name: null,
      created: null,
      roles: []
    },
    loginAs: false,
    token: null,
    expires: null
  },

  getters: {
    getUserInfo: state => state.user,
    getToken: state => state.token,
    getLoginAs: state => state.loginAs
  },

  actions: {
    initUserAuth ({ commit, dispatch }, router) {
      if (getCookie('_id') && getCookie('_token') && getCookie('_expires')) {
        if (new Date(getCookie('_expires')) > new Date()) {
          dispatch('saveAuthToken', {
            token: getCookie('_token'),
            expires: getCookie('_expires')
          })
          dispatch('saveUserId', getCookie('_id'))
        }
      }

      const userId = localStorage.getItem('_id')
      const token = localStorage.getItem('_token')
      const expires = localStorage.getItem('_expires')

      let params = new URLSearchParams(window.location.search)
      const xrt = sessionStorage.getItem('_xrt') || params.get('as')

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

        if (xrt) {
          sessionStorage.setItem('_xrt', xrt)
          api.axios.defaults.headers.common['X-Relay-Tennant'] = xrt
          commit(SAVE_LOGIN_AS_STATUS, xrt)

          Model.$http = api.axios
        }

        /** Get user info **/
        api.users.find('me').then(response => {
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

    userLogout ({ commit, dispatch }, router) {
      setCookie('_id', '', { expires: -1, domain: getCookie('_domain') })
      setCookie('_token', '', { expires: -1, domain: getCookie('_domain') })
      setCookie('_expires', '', { expires: -1, domain: getCookie('_domain') })
      localStorage.clear()
      commit(RESET_AUTH_DATA)

      if (config.LOCALSIGN) {
        window.location.href = '/sign'
      } else {
        window.location.href = config.SWY_CONNECTOR_URL + '/signin'
      }
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
      state.user.uid = user.uid
      state.user.name = user.name
      state.user.created = user.created
      state.user.roles = user.roles
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
    },
    [SAVE_LOGIN_AS_STATUS] (state, status) {
      state.loginAs = status
    }
  }
}
