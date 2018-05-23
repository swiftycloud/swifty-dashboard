import {
  API_GATE_ENDPOINT
} from '@/api/config'
import { Collection } from 'vue-mc'

export default class extends Collection {
  getRequest (config) {
    config.url = API_GATE_ENDPOINT + config.url
    config.headers = {
      common: {
        'X-Auth-Token': localStorage.getItem('_token')
      }
    }

    return super.getRequest(config)
  }
}
