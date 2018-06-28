/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import Model from '@/models/Model'
import Collection from '@/models/Collection'

export class AuthService extends Model {
  defaults () {
    return {
      id: null,
      name: null,
      type: null
    }
  }

  routes () {
    return {
      fetch: '/auths/{id}',
      save: '/auths',
      delete: '/auths/{id}'
    }
  }
}

export class AuthServiceList extends Collection {
  model () {
    return AuthService
  }

  defaults () {
    return {
      project: 'default'
    }
  }

  routes () {
    return {
      fetch: '/auths?project={project}'
    }
  }
}
