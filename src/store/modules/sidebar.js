import * as types from '../mutation-types'

const state = {
  hidden: false
}

const getters = {
  checkHiddenStatus: state => state.hidden
}

const actions = {
  showSidebar ({ commit, state }) {
    commit(types.SET_HIDDEN_STATUS, false)
  },
  hideSidebar ({ commit, state }) {
    commit(types.SET_HIDDEN_STATUS, true)
  }
}

const mutations = {
  [types.SET_HIDDEN_STATUS] (state, status) {
    state.hidden = status
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
