/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import { CustomModel, CustomCollection } from '@/models'

export class Middleware extends CustomModel {
  defaults () {
    return {
      id: null,
      name: null,
      type: null
    }
  }

  routes () {
    return {
      fetch: '/middleware/{id}',
      save: '/middleware',
      delete: '/middleware/{id}'
    }
  }
}

export class MiddlewareList extends CustomCollection {
  model () {
    return Middleware
  }

  defaults () {
    return {
      project: 'default',
      details: false,
      type: false
    }
  }

  routes () {
    return {
      fetch: '/middleware?project={project}&details={details}&type={type}'
    }
  }

  get deactivated () {
    return this.state === 'deactivated'
  }
}
