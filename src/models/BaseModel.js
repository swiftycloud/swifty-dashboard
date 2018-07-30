import config from '@/api/config'
import api from '@/api'
import { Model } from 'vue-api-query'

Model.$http = api.axios

export default class BaseModel extends Model {
  baseURL () {
    return config.API_GATE_ENDPOINT
  }

  request (config) {
    return this.$http.request(config)
  }
}
