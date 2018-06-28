/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import cfg from '@/api/config'
import { Model } from 'vue-mc'

export default class extends Model {
  getRequest (config) {
    config.url = cfg.API_GATE_ENDPOINT + config.url
    config.headers = {
      common: {
        'X-Auth-Token': localStorage.getItem('_token')
      }
    }

    return super.getRequest(config)
  }
}
