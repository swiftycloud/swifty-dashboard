<template>
  <div class="page-content" v-loading="loading">
    <p>Here you can manage your files</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="$router.push({ name: 'storage' })">Back to Buckets</el-button>
      <el-button type="primary" size="medium" @click="uploadDialogVisible = true">Upload</el-button>
      <el-button type="primary" size="medium">Create Folder</el-button>
      <el-button plain size="medium" @click="deleteSelected" :disabled="multipleSelection.length === 0">Delete</el-button>
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button plain size="medium">More <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown" class="bucket-menu">
          <el-dropdown-item>Get size</el-dropdown-item>
          <el-dropdown-item>Download as</el-dropdown-item>
          <el-dropdown-item>Rename</el-dropdown-item>
          <el-dropdown-item>Copy</el-dropdown-item>
          <el-dropdown-item>Past</el-dropdown-item>
          <el-dropdown-item>Cut</el-dropdown-item>
          <el-dropdown-item>Open</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-table
      ref="multipleTable"
      :data="objects"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <div slot="empty">
          <p>You don’t have any files in your bucket</p>
          <el-button type="primary" size="mini" round >Upload</el-button>
      </div>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="Key"
        label="Name"
        sortable>
      </el-table-column>
      <el-table-column
        property="LastModified"
        label="Last Modified"
        sortable
        show-overflow-tooltip>
        <template slot-scope="scope">
         {{ scope.row.LastModified | moment('from', 'now') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Size"
        label="Size"
        sortable
        width="120">
        <template slot-scope="scope">
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
      uploadDialogVisible: false,
      multipleSelection: [],
      loading: true,
      uploading: false
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'storage', title: 'Object Storage' })
    this.$store.dispatch('setPageTitle', this.$route.params.name)
    this.fetchListObjects()
  },
  methods: {
    fetchListObjects () {
      this.loading = true
      return this.$store.dispatch('fetchS3BucketListObjects', {
        project: this.$store.getters.currentProject,
        bucket: this.$route.params.name
      }).then(data => {
        this.objects = data.Contents
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
        file: option.file
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
</style>
