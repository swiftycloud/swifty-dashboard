/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import { CustomModel, CustomCollection } from '@/models'

export class RepoAccount extends CustomModel {
  defaults () {
    return {
      type: 'github',
      github_name: null
    }
  }

  routes () {
    return {
      fetch: '/accounts/{id}',
      save: '/accounts',
      update: '/accounts/{id}',
      delete: '/accounts/{id}'
    }
  }
}

export class RepoAccountList extends CustomCollection {
  model () {
    return RepoAccount
  }

  routes () {
    return {
      fetch: '/accounts'
    }
  }
}
