/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import {
  SAVE_BUCKETS
} from '../mutation-types.js'
import api from '@/api'

export default {
  state: {
    buckets: []
  },

  getters: {
    getS3Buckets: state => state.buckets
  },

  actions: {
    getS3Credentials ({ state }, { project, access, lifetime, bucket }) {
      return api.middlewareAccessS3(project, access, lifetime, bucket)
    },

    fetchS3ListBuckets ({ dispatch, commit }, { project }) {
      return api.s3('listBuckets', project).then(data => {
        commit(SAVE_BUCKETS, data.Buckets)
        return data
      })
    },

    createS3Bucket ({ dispatch }, { project, bucket }) {
      return api.s3('createBucket', project, { Bucket: bucket })
    },

    deleteS3Bucket ({ dispatch }, { project, bucket }) {
      return api.s3('deleteBucket', project, { Bucket: bucket })
    },

    fetchS3BucketListObjects ({ commit }, { project, bucket, prefix }) {
      return api.s3('listObjectsV2', project, { Prefix: prefix, Bucket: bucket, Delimiter: '/' }, bucket)
    },

    getS3Object ({ dispatch }, { project, bucket, filename, prefix }) {
      return api.s3('getObject', project, { Bucket: bucket, Key: prefix + filename }, bucket)
    },

    renameS3Object ({ dispatch }, { project, bucket, oldName, newName, prefix }) {
      return api.s3('copyObject', project, {
        Bucket: bucket,
        CopySource: '/' + bucket + '/' + prefix + oldName,
        Key: prefix + newName
      }, bucket).then(response => {
        return dispatch('deleteS3Object', { project: project, bucket: bucket, object: prefix + oldName })
      })
    },

    copyS3Object ({ dispatch }, { project, bucket, oldPath, newPath }) {
      return api.s3('copyObject', project, {
        Bucket: bucket,
        CopySource: '/' + bucket + '/' + oldPath,
        Key: newPath
      }, bucket)
    },

    uploadS3Object ({ dispatch }, { project, bucket, file, prefix }) {
      return api.s3('upload', project, { Bucket: bucket, Body: file, Key: prefix + file.name }, bucket)
    },

    createS3Folder ({ dispatch }, { project, bucket, name, prefix }) {
      prefix = prefix || ''
      return api.s3('putObject', project, { Bucket: bucket, Key: prefix + name + '/' }, bucket)
    },

    deleteS3Object ({ dispatch }, { project, bucket, object }) {
      return api.s3('deleteObject', project, { Bucket: bucket, Key: object }, bucket)
    },

    getMetricStatistics ({ dispatch }, { project, data }) {
      return api.cw('getMetricStatistics', project, data)
    }
  },

  mutations: {
    [SAVE_BUCKETS] (state, buckets) {
      state.buckets = buckets
    }
  }
}
