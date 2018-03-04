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
      })
    },

    createS3Bucket ({ dispatch }, { project, bucket }) {
      return api.s3('createBucket', project, { Bucket: bucket })
    },

    deleteS3Bucket ({ dispatch }, { project, bucket }) {
      return api.s3('deleteBucket', project, { Bucket: bucket })
    },

    fetchS3BucketListObjects ({ commit }, { project, bucket }) {
      return api.s3('listObjectsV2', project, { Bucket: bucket }, bucket)
    },

    uploadS3Object ({ dispatch }, { project, bucket, file }) {
      return api.s3('upload', project, { Bucket: bucket, Body: file, Key: file.name }, bucket)
    },

    deleteS3Object ({ dispatch }, { project, bucket, object }) {
      return api.s3('deleteObject', project, { Bucket: bucket, Key: object }, bucket)
    }
  },

  mutations: {
    [SAVE_BUCKETS] (state, buckets) {
      state.buckets = buckets
    }
  }
}
