/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import { CustomModel, CustomCollection } from '@/models'

export class Repository extends CustomModel {
  defaults () {
    return {
      id: null,
      url: null,
      type: null
    }
  }

  routes () {
    return {
      fetch: '/repos/{id}',
      save: '/repos',
      update: '/repos/{id}',
      delete: '/repos/{id}'
    }
  }
}

export class RepositoryList extends CustomCollection {
  model () {
    return Repository
  }

  routes () {
    return {
      fetch: '/repos'
    }
  }
}
