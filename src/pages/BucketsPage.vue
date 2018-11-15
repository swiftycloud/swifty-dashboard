<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content" v-loading="loading">
    <p>Here you can manage your buckets</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="openCreateBucketForm">Create Bucket</el-button>
      <el-button type="primary" size="medium" @click="credentialsDialogVisible = true">Get S3 Credentials</el-button>
      <el-button type="primary" plain size="medium" @click="deleteSelected" :disabled="multipleSelection.length === 0">Delete</el-button>
    </div>

    <el-table
      ref="multipleTable"
      :data="$store.getters.getS3Buckets"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="Name"
        label="Name"
        sortable>
        <template slot-scope="scope">
          <a href="#" @click.prevent="$router.push({ name: 'bucket.view', params: { name: scope.row.Name } })">{{ scope.row.Name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="CreationDate"
        label="Created"
        sortable>
        <template slot-scope="scope">
         {{ scope.row.CreationDate | moment('from', 'now') }}
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Get Object Storage Access Keys"
      :visible.sync="credentialsDialogVisible"
      custom-class="s3-access-keys-dialog">
      <el-form label-width="140px">
        <el-form-item label="Select key’s lifetime" class="expires-selector">
          <el-select v-model="credentials.expires">
            <el-option label="30 days" :value="30 * 24 * 60 * 60"></el-option>
            <el-option label="90 days" :value="90 * 24 * 60 * 60"></el-option>
            <el-option label="360 days" :value="360 * 24 * 60 * 60"></el-option>
            <el-option label="Unlimited" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Access Key ID:" style="margin-bottom: 0" v-if="credentials.key">
          <code>{{ credentials.key }}</code>
        </el-form-item>
        <el-form-item label="Secret Access Key:" style="margin-bottom: 0" v-if="credentials.secret">
          <code>{{ credentials.secret }}</code>
        </el-form-item>
        <el-form-item label="API Endpoint:" style="margin-bottom: 0" v-if="credentials.secret">
          <code>{{ credentials.endpoint }}</code>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="credentialsDialogCancel">Close</el-button>
        <el-button @click="getS3Credentials" type="primary" :loading="s3DialogLoading" v-if="!credentials.key || !credentials.secret">Show Keys</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: true,
      multipleSelection: [],
      credentialsDialogVisible: false,
      credentials: {
        expires: 30 * 24 * 60 * 60, // 30 days
        key: null,
        secret: null,
        endpoint: null
      },
      s3DialogLoading: false
    }
  },
  created () {
    this.$store.dispatch('setPageTitle', 'Object Storage')
    this.$store.dispatch('fetchS3ListBuckets', {
      project: this.$store.getters.currentProject
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    openCreateBucketForm () {
      this.$prompt('Name', 'New S3 Bucket', {
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        inputPattern: /^[A-z\d]+$/,
        inputErrorMessage: 'Name is invalid'
      }).then(value => {
        this.loading = true
        return this.$store.dispatch('createS3Bucket', {
          project: this.$store.getters.currentProject,
          bucket: value.value
        }).then(response => {
          this.$router.push({ name: 'bucket.view', params: { name: value.value } })
        })
      }).catch(error => {
        if (error.message) {
          this.$notify.error({
            title: 'Error',
            message: error.message
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    deleteSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected buckets will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach((self) => {
          promises.push(
            this.$store.dispatch('deleteS3Bucket', {
              project: this.$store.state.projects.currentProject,
              bucket: self.Name
            }).catch(error => {
              var errorMessage = null

              if (error.code === 'BucketNotEmpty') {
                errorMessage = 'Bucket ' + self.Name + ' not empty'
              }

              this.$notify.error({
                title: 'Error',
                message: errorMessage || error.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.$store.dispatch('fetchS3ListBuckets', this.$store.getters.currentProject)
      }).catch(() => {
        // ..
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    credentialsDialogCancel () {
      this.credentials.expires = 30 * 24 * 60 * 60
      this.credentials.key = null
      this.credentials.secret = null
      this.credentials.endpoint = null
      this.credentialsDialogVisible = false
    },

    getS3Credentials () {
      this.s3DialogLoading = true
      this.$store.dispatch('getS3Credentials', {
        project: this.$store.getters.currentProject,
        lifetime: this.credentials.expires
      }).then(response => {
        this.credentials.key = response.data.key
        this.credentials.secret = response.data.secret
        this.credentials.endpoint = response.data.endpoint
        this.credentialsDialogVisible = true
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      }).finally(() => {
        this.s3DialogLoading = false
      })
    }
  }
}
</script>

<style lang="scss">
  .expires-selector .el-form-item__label {
    color: #9b9b9b !important;
  }

  .s3-access-keys-dialog .el-dialog__footer {
    text-align: left !important;
  }
</style>
