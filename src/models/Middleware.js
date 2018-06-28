/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import Model from '@/models/Model'
import Collection from '@/models/Collection'

export class Middleware extends Model {
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

export class MiddlewareList extends Collection {
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
