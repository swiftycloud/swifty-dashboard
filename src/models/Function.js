/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import Model from '@/models/Model'
import Collection from '@/models/Collection'

export class Function extends Model {
  defaults () {
    return {
      id: null,
      name: '',
      state: ''
    }
  }

  mutations () {
    return {
      id: String,
      name: String,
      state: String
    }
  }

  routes () {
    return {
      fetch: '/functions/{id}',
      save: '/functions',
      state: '/functions/{id}/state',
      authctx: '/functions/{id}/authctx'
    }
  }

  updateState (value) {
    let method = 'PUT'
    let route = this.getRoute('state')
    let url = this.getURL(route, { id: this.id })
    let data = '"' + value + '"'

    return this.getRequest({ method, url, data }).send()
  }

  activate () {
    return this.updateState('ready')
  }

  deactivate () {
    return this.updateState('deactivated')
  }

  updateAuthCtx (value) {
    let method = 'PUT'
    let route = this.getRoute('authctx')
    let url = this.getURL(route, { id: this.id })
    let data = '"' + value + '"'

    return this.getRequest({ method, url, data }).send()
  }
}

export class FunctionList extends Collection {
  model () {
    return Function
  }

  defaults () {
    return {
      project: 'default',
      details: true
    }
  }

  routes () {
    return {
      fetch: '/functions?project={project}&details={details}'
    }
  }

  get deactivated () {
    return this.state === 'deactivated'
  }
}
