import axios from 'axios'
import AWS from 'aws-sdk'
import * as config from '@/api/config'

export default {
  axios: axios,
  aws: {
    instance: null,
    credentials: null
  },

  requestApiToken () {
    return axios.post(config.API_ADMD_ENDPOINT + '/login', {
      username: config.API_USERNAME,
      password: config.API_PASSWORD
    })
  },

  /** USER METHODS **/

  userCreate (id, password, name, token) {
    return axios.post(config.API_ADMD_ENDPOINT + '/adduser', {
      id: id, pass: password, name: name
    }, {
      headers: { 'X-Auth-Token': token }
    })
  },

  userLogin (id, password) {
    return axios.post(config.API_ADMD_ENDPOINT + '/login', {
      username: id, password: password
    })
  },

  userInfo (id) {
    return axios.post(config.API_ADMD_ENDPOINT + '/userinfo', {
      id: id
    })
  },

  /** PROJECT METHODS **/

  projectList () {
    return axios.post(config.API_GATE_ENDPOINT + '/project/list', {})
  },

  projectDelete (project) {
    return axios.post(config.API_GATE_ENDPOINT + '/project', {
      project: project
    })
  },

  /** STATS METHODS **/

  stats (periods) {
    return axios.post(config.API_GATE_ENDPOINT + '/stats', {
      periods: periods
    })
  },

  /** FUNCTION METHODS **/

  functionWait (project, name, timeout, version) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/wait', {
      project: project,
      name: name,
      timeout: timeout,
      version: version
    })
  },

  functionList (project) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/list', {
      project: project
    })
  },

  functionListInfo (project, periods) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/list/info', {
      project: project, periods: periods
    })
  },

  functionAdd (data) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/add', data)
  },

  functionUpdate (data) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/update', data)
  },

  functionRemove (project, name) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/remove', {
      project: project, name: name
    })
  },

  functionRun (project, name, args) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/run', {
      project: project, name: name, args: args
    })
  },

  functionLogs (project, name) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/logs', {
      project: project, name: name
    })
  },

  functionInfo (project, name) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/info', {
      project: project, name: name
    })
  },

  functionStats (project, name) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/stats', {
      project: project, name: name
    })
  },

  functionCode (project, name, version) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/code', {
      project: project, name: name, version: version
    })
  },

  functionState (project, name, state) {
    return axios.post(config.API_GATE_ENDPOINT + '/function/state', {
      project: project, name: name, state: state
    })
  },

  /** MIDDLEWARE **/

  middlewareList (project) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/list', {
      project: project
    })
  },

  middlewareAdd (project, id, type) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/add', {
      project: project, id: id, type: type
    })
  },

  middlewareInfo (project, id) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/info', {
      project: project, id: id
    })
  },

  middlewareRemove (project, id) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/remove', {
      project: project, id: id
    })
  },

  middlewareAccessS3 (project, bucket, lifetime, access) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/access/s3', {
      project: project,
      bucket: bucket,
      lifetime: lifetime,
      access: access
    })
  },

  /** INFO **/

  infoLangs () {
    return axios.post(config.API_GATE_ENDPOINT + '/info/langs')
  },

  infoMiddlewares () {
    return axios.post(config.API_GATE_ENDPOINT + '/info/mwares')
  },

  /** S3 API **/

  s3GetInstance (project, bucket) {
    if (this.aws.credentials !== null && !this.aws.credentials.needsRefresh() && this.aws.credentials.bucketName === bucket) {
      return new Promise((resolve, reject) => {
        resolve(this.aws.instance)
      })
    }

    return this.middlewareAccessS3(project, bucket, undefined, ['hidden']).then(response => {
      this.aws.credentials = new AWS.Credentials({
        accessKeyId: response.data.key,
        secretAccessKey: response.data.secret
      })

      this.aws.credentials.expiryWindow = 5
      this.aws.credentials.expireTime = AWS.util.date.getDate().getTime() + (response.data.expires * 1000)
      this.aws.credentials.bucketName = bucket

      this.aws.instance = new AWS.S3({
        credentials: this.aws.credentials,
        endpoint: 'https://' + response.data.endpoint,
        apiVersion: '2006-03-01',
        s3ForcePathStyle: true
      })

      return this.aws.instance
    })
  },

  s3 (method, project, data, bucket) {
    return this.s3GetInstance(project, bucket).then(s3 => {
      return new Promise((resolve, reject) => {
        if (s3[method] === undefined) {
          return reject(new Error(method + ': this method is not exists'))
        }

        s3[method](data, (err, data) => err ? reject(err) : resolve(data))
      })
    })
  }
}
