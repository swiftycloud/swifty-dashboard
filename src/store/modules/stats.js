import api from '@/api'

export default {
  state: {
    periods: {
      'Current Period': 0,
      'Previous Period': 1
    }
  },

  getters: {
    getPeriods: state => state.periods
  },

  actions: {
    getStats ({ commit }, periods) {
      return api.stats(periods)
    }
  },

  mutations: {
    // ...
  }
}
