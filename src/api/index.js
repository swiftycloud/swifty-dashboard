/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import axios from 'axios'
import AWS from 'aws-sdk'
import config from '@/api/config'

AWS.config.update({ region: 'us-west-2' })

var resource = (path, ac = {}, ax = axios) => {
  // support invoking like: `resource('/api', axios)`
  // and `resource('/api', null, axios)`
  let http = ax
  let actions = ac
  if (actions && actions.Axios) {
    http = actions
    actions = {}
  }
  const resource = {
    get: params => http.get(path, { params }),
    find: id => http.get(path + '/' + id),
    create: data => http.post(path, data),
    update: (id, data) => http.put(path + (id !== null ? '/' + id : ''), data),
    delete: id => http.delete(path + '/' + id)
  }
  return Object.assign(resource, actions)
}

export default {
  axios: axios,
  aws: {
    instance: null,
    credentials: null
  },
  cloudwatch: {
    instance: null,
    credentials: null
  },

  functions: resource(config.API_GATE_ENDPOINT + '/functions', {
    one: (fid) => {
      return {
        triggers: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/triggers'),
        sources: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/sources'),
        size: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/size'),
        middleware: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/middleware'),
        state: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/state'),
        s3buckets: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/s3buckets'),
        authctx: resource(config.API_GATE_ENDPOINT + '/functions/' + fid + '/authctx'),

        // actions
        run: data => axios.post(config.API_GATE_ENDPOINT + '/functions/' + fid + '/run', data),
        wait: data => axios.post(config.API_GATE_ENDPOINT + '/functions/' + fid + '/wait', data)
      }
    }
  }),

  middleware: resource(config.API_GATE_ENDPOINT + '/middleware'),

  auths: resource(config.API_GATE_ENDPOINT + '/auths'),

  deployments: resource(config.API_GATE_ENDPOINT + '/deployments'),

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

  middlewareListInfo (project) {
    return axios.post(config.API_GATE_ENDPOINT + '/mware/list/info', {
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
    return axios.post(config.API_GATE_ENDPOINT + '/s3/access', {
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

      this.aws.credentials.expiryWindow = 10
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
  },

  cwGetInstance (project, bucket) {
    if (this.cloudwatch.credentials !== null && !this.cloudwatch.credentials.needsRefresh() && this.cloudwatch.credentials.bucketName === bucket) {
      return new Promise((resolve, reject) => {
        resolve(this.cloudwatch.instance)
      })
    }

    return this.middlewareAccessS3(project, bucket, undefined, ['hidden']).then(response => {
      this.cloudwatch.credentials = new AWS.Credentials({
        accessKeyId: response.data.key,
        secretAccessKey: response.data.secret
      })

      this.cloudwatch.credentials.expiryWindow = 10
      this.cloudwatch.credentials.expireTime = AWS.util.date.getDate().getTime() + (response.data.expires * 1000)
      this.cloudwatch.credentials.bucketName = bucket

      this.cloudwatch.instance = new AWS.CloudWatch({
        credentials: this.cloudwatch.credentials,
        endpoint: 'https://' + response.data.endpoint,
        apiVersion: '2010-08-01'
      })

      return this.cloudwatch.instance
    })
  },

  cw (method, project, data, bucket) {
    return this.cwGetInstance(project, bucket).then(cw => {
      return new Promise((resolve, reject) => {
        if (cw[method] === undefined) {
          return reject(new Error(method + ': this method is not exists'))
        }

        cw[method](data, (err, data) => err ? reject(err) : resolve(data))
      })
    })
  }
}
