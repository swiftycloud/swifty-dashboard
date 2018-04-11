<template>
  <div class="page-content" v-loading="loading">
    <p>Here you can manage your objects</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="$router.push({ name: 'storage' })">Back to Buckets</el-button>
      <el-button type="primary" size="medium" @click="uploadDialogVisible = true">Upload</el-button>
      <el-button type="primary" size="medium" @click="openCreatingFolderForm">Create Folder</el-button>
      <el-button plain size="medium" @click="deleteSelected" :disabled="multipleSelection.length === 0">Delete</el-button>
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button plain size="medium">More <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown" class="bucket-menu">
          <el-dropdown-item>Download as</el-dropdown-item>
          <el-dropdown-item>Rename</el-dropdown-item>
          <el-dropdown-item>Copy</el-dropdown-item>
          <el-dropdown-item>Past</el-dropdown-item>
          <el-dropdown-item>Cut</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'bucket.view', params: { name: $route.params.name } }">{{ $route.params.name }}</el-breadcrumb-item>
      <el-breadcrumb-item v-for="data in prefixArray" :key="data.name" :to="{ name: 'bucket.view.prefix', params: { name: $route.params.name, prefix: data.prefix } }">{{ data.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-table
      ref="multipleTable"
      :data="objects"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <div slot="empty">
          <p v-if="prefix === undefined">You don’t have any files in your bucket</p>
          <p v-if="prefix !== undefined">You don't have any files in the folder</p>
          <el-button type="primary" size="mini" round @click="uploadDialogVisible = true">Upload</el-button>
      </div>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="Key"
        label="Name"
        sortable>
        <template slot-scope="scope" class="bucket-object-name">
          <a style="text-decoration: none" href="#" @click.prevent="openFolder(scope.row.Key)" v-if="scope.row.Folder">
            <i class="fa fa-folder"></i> {{ scope.row.Key.replace(prefix, '') }}
          </a>
          <span v-if="scope.row.Folder === undefined"><i class="fa fa-file"></i> {{ scope.row.Key.replace(prefix, '') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        property="LastModified"
        label="Last Modified"
        sortable
        show-overflow-tooltip>
        <template slot-scope="scope" v-if="scope.row.LastModified !== null">
         {{ scope.row.LastModified | moment('from', 'now') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Size"
        label="Size"
        sortable
        width="120">
        <template slot-scope="scope" v-if="scope.row.Size !== null">
          {{ scope.row.Size | prettyBytes }}
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Upload files"
      :visible.sync="uploadDialogVisible"
      width="600px">
      <el-upload
        ref="upload"
        drag
        multiple
        action=""
        :http-request="handlerFileUpload"
        :auto-upload="false"
        list-type="picture">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelUploadDialog" :disabled="uploading">Cancel</el-button>
        <el-button type="primary" @click="submitUpload" :disabled="uploading">Upload</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      objects: [],
      prefix: '',
      uploadDialogVisible: false,
      multipleSelection: [],
      loading: true,
      uploading: false
    }
  },
  created () {
    this.$store.dispatch('setPageTitle', this.$route.params.name)
    this.$store.dispatch('setParentPage', { name: 'storage', title: 'Object Storage' })
    this.prefix = this.$route.params.prefix
    this.fetchListObjects()
  },
  watch: {
    '$route': function () {
      this.$store.dispatch('setPageTitle', this.$route.params.name)
      this.$store.dispatch('setParentPage', { name: 'storage', title: 'Object Storage' })

      this.prefix = this.$route.params.prefix
      this.fetchListObjects()
    }
  },
  computed: {
    prefixArray: function () {
      if (this.prefix === undefined) {
        return ''
      }

      var data = []
      this.prefix.split('/').forEach(v => {
        if (v !== '') {
          data.push({
            name: v,
            prefix: this.prefix.substring(0, this.prefix.indexOf(v) + v.length + 1)
          })
        }
      })

      return data
    }
  },
  methods: {
    fetchListObjects () {
      this.loading = true
      return this.$store.dispatch('fetchS3BucketListObjects', {
        project: this.$store.getters.currentProject,
        bucket: this.$route.params.name,
        prefix: this.prefix
      }).then(data => {
        this.objects = []

        for (var k in data.CommonPrefixes) {
          if (this.prefix !== data.CommonPrefixes[k].Prefix) {
            this.objects.push({
              Key: data.CommonPrefixes[k].Prefix,
              LastModified: null,
              Size: null,
              Folder: true
            })
          }
        }

        for (k in data.Contents) {
          if (this.prefix !== data.Contents[k].Key) {
            this.objects.push(data.Contents[k])
          }
        }
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    cancelUploadDialog () {
      this.uploadDialogVisible = false
      this.$refs.upload.clearFiles()
    },

    submitUpload () {
      this.$refs.upload.submit()
    },

    handlerFileUpload (option) {
      this.uploading = true
      this.$store.dispatch('uploadS3Object', {
        project: this.$store.getters.currentProject,
        bucket: this.$route.params.name,
        file: option.file,
        prefix: this.prefix
      }).then(response => {
        option.onSuccess(response.Location)
        this.$notify.success({
          title: option.file.name,
          message: 'File successfully uploaded'
        })
        this.fetchListObjects()
      }).catch(error => {
        option.onError(error)
        this.$notify.error({
          title: option.file.name,
          message: error.message
        })
      }).finally(() => {
        this.uploading = false
      })
    },

    openFolder (prefix) {
      this.objects = []
      this.prefix = prefix
      this.fetchListObjects().then(() => {
        return this.$router.push({ name: 'bucket.view.prefix', params: { name: this.$route.params.name, prefix: prefix } })
      })

      return false
    },

    openCreatingFolderForm () {
      this.$prompt('Name', 'New Folder', {
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        inputPattern: /^[A-z\d]+$/,
        inputErrorMessage: 'Name is invalid'
      }).then(value => {
        this.loading = true
        return this.$store.dispatch('createS3Folder', {
          project: this.$store.getters.currentProject,
          bucket: this.$route.params.name,
          name: value.value,
          prefix: this.prefix
        })
      }).then(() => {
        return this.fetchListObjects()
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

      this.$confirm('Selected objects will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach((self) => {
          promises.push(
            this.$store.dispatch('deleteS3Object', {
              project: this.$store.state.projects.currentProject,
              bucket: this.$route.params.name,
              object: self.Key
            }).catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchListObjects()
      }).catch(() => {
        // ..
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss">
  .el-upload, .el-upload-dragger {
    width: 100% !important;
  }

  .bucket-menu {
    min-width: 224px !important;
  }

  .page-content .el-breadcrumb {
    padding: 10px 0 !important;

    .el-breadcrumb__item {
      .el-breadcrumb__separator,
      .el-breadcrumb__inner {
        font-weight: normal !important;
      }
    }
  }

  .el-table .cell .fa {
    width: 14px !important;
    display: inline-block;
  }
</style>
