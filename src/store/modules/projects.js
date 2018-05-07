import {
  SAVE_PROJECTS_LIST,
  UPDATE_CURRENT_PROJECT
} from '@/store/mutation-types'
import api from '@/api'

export default {
  state: {
    projects: [],
    currentProject: 'default'
  },

  getters: {
    getProjects: state => state.projects,
    currentProject: state => state.currentProject,
    project: state => state.currentProject
  },

  actions: {
    fetchProjects ({ commit }) {
      return api.projectList().then(response => {
        if (response.data !== null && 'functions' in response.data) {
          commit(SAVE_PROJECTS_LIST, response.data.functions)
        } else {
          commit(SAVE_PROJECTS_LIST, [])
        }
      })
    }
  },

  mutations: {
    [SAVE_PROJECTS_LIST] (state, projects) {
      state.projects = projects
    },
    [UPDATE_CURRENT_PROJECT] (state, value) {
      state.currentProject = value
    }
  }
}
