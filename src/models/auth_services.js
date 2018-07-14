/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import { CustomModel, CustomCollection } from '@/models'

export class AuthService extends CustomModel {
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

export class AuthServiceList extends CustomCollection {
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
