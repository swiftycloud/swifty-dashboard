/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import cfg from '@/api/config'
import { Model, Collection } from 'vue-mc'

export class CustomModel extends Model {
  getRequest (config) {
    config.url = cfg.API_GATE_ENDPOINT + config.url
    config.headers = {
      common: {
        'X-Auth-Token': localStorage.getItem('_token')
      }
    }

    if (sessionStorage.getItem('_xrt')) {
      config.headers.common['X-Relay-Tennant'] = sessionStorage.getItem('_xrt')
    }

    return super.getRequest(config)
  }

  options () {
    return {
      methods: {
        'fetch': 'GET',
        'save': 'POST',
        'update': 'PUT',
        'create': 'POST',
        'patch': 'PATCH',
        'delete': 'DELETE'
      }
    }
  }
}

export class CustomCollection extends Collection {
  getRequest (config) {
    config.url = cfg.API_GATE_ENDPOINT + config.url
    config.headers = {
      common: {
        'X-Auth-Token': localStorage.getItem('_token')
      }
    }

    if (sessionStorage.getItem('_xrt')) {
      config.headers.common['X-Relay-Tennant'] = sessionStorage.getItem('_xrt')
    }

    return super.getRequest(config)
  }
}
