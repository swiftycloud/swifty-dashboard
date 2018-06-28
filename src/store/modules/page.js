/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import {
  SET_PAGE_TITLE,
  SET_APP_LOADING_STATUS,
  SET_SIGN_LOADING_STATUS,
  SET_FUNCTION_ACTIVE_TAB,
  SET_STATS_ACTIVE_TAB,
  SET_PARENT_PAGE
} from '../mutation-types'

export default {
  state: {
    title: null,
    appLoadingStatus: true,
    signLoadingStatus: false,
    functionActiveTab: 'code',
    statsActiveTab: 'func',
    parentPage: null
  },

  getters: {
    getPageTitle: state => state.title,
    getParentPage: state => state.parentPage,
    getAppLoadingState: state => state.appLoadingStatus,
    getSignLoadingState: state => state.signLoadingStatus,
    getFunctionActiveTab: state => state.functionActiveTab,
    getStatsActiveTab: state => state.statsActiveTab
  },

  actions: {
    setPageTitle ({ commit, state }, title) {
      commit(SET_PAGE_TITLE, title)
    },
    setParentPage ({ commit }, data) {
      commit(SET_PARENT_PAGE, data)
    },
    setAppLoadingStatus ({ commit }, status) {
      commit(SET_APP_LOADING_STATUS, status)
    },
    setSignLoadingStatus ({ commit, state }, status) {
      commit(SET_SIGN_LOADING_STATUS, status)
    },
    setFunctionActiveTab ({ commit }, val) {
      commit(SET_FUNCTION_ACTIVE_TAB, val)
    },
    setStatsActiveTab ({ commit }, val) {
      commit(SET_STATS_ACTIVE_TAB, val)
    }
  },

  mutations: {
    [SET_PAGE_TITLE] (state, title) {
      state.title = title
    },
    [SET_APP_LOADING_STATUS] (state, status) {
      state.appLoadingStatus = status
    },
    [SET_SIGN_LOADING_STATUS] (state, status) {
      state.signLoadingStatus = status
    },
    [SET_FUNCTION_ACTIVE_TAB] (state, val) {
      state.functionActiveTab = val
    },
    [SET_STATS_ACTIVE_TAB] (state, val) {
      state.statsActiveTab = val
    },
    [SET_PARENT_PAGE] (state, data) {
      state.parentPage = data
    }
  }
}
