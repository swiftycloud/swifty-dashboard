<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content" v-loading="loading">
    <p>Here you can manage your objects</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="$router.push({ name: 'storage' })">Back to Buckets</el-button>
      <el-button type="primary" size="medium" @click="uploadDialogVisible = true">Upload</el-button>
      <el-button type="primary" size="medium" @click="openCreatingFolderForm">Create Folder</el-button>
      <!--<el-button plain size="medium" @click="deleteSelected" :disabled="multipleSelection.length === 0">Delete</el-button>-->
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button plain size="medium">More <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown" class="bucket-menu">
          <el-dropdown-item @click.native="cutSelected">Cut</el-dropdown-item>
          <el-dropdown-item @click.native="copySelected">Copy</el-dropdown-item>
          <el-dropdown-item @click.native="pasteObjects">Paste</el-dropdown-item>
          <el-dropdown-item @click.native="deleteSelected">Delete</el-dropdown-item>
          <el-dropdown-item @click.native="openHttpServerSettings">HTTP Server Settings</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'bucket.view', params: { name: $route.params.name } }">
        <i class="fa fa-folder"></i> {{ $route.params.name }}
      </el-breadcrumb-item>
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
      <el-table-column width="34">
        <template slot-scope="scope">
          <i class="fa fa-folder" v-if="scope.row.Folder" :class="{ buffered : isCopyOrCut(scope.row.Key) }"></i>
          <i class="fa fa-file-o" v-if="scope.row.Folder === undefined" :class="{ buffered : isCopyOrCut(scope.row.Key) }"></i>
        </template>
      </el-table-column>
      <el-table-column
        prop="Key"
        label="Name"
        sortable>
        <template slot-scope="scope" class="bucket-object-name" v-if="!loading">
          <a style="text-decoration: none" href="#" @click.prevent="openFolder(scope.row.Key)" v-if="scope.row.Folder">
            {{ scope.row.Key.replace(prefix, '').replace('/', '') }}
          </a>

          <el-dropdown
            trigger="click"
            placement="bottom-start"
            v-if="scope.row.Folder"
            class="bucket-object-link-dropdown">
            <el-button type="text" size="medium" class="bucket-object-link">
              <i class="fa fa-ellipsis-h"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="bucket-menu">
              <el-dropdown-item @click.native="cutObjectToBuffer(scope.row.Key)">Cut</el-dropdown-item>
              <el-dropdown-item @click.native="copyObjectToBuffer(scope.row.Key)">Copy</el-dropdown-item>
              <!--<el-dropdown-item>Paste</el-dropdown-item>-->
              <el-dropdown-item>Delete</el-dropdown-item>
              <el-dropdown-item @click.native="renameObject(scope.row.Key.replace(prefix, ''))">Rename</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <span v-if="scope.row.Folder === undefined" :class="{ buffered : isCopyOrCut(scope.row.Key) }">
            {{ scope.row.Key.replace(prefix, '') }}
          </span>

          <el-dropdown
            trigger="click"
            placement="bottom-start"
            v-if="scope.row.Folder === undefined"
            class="bucket-object-link-dropdown">
            <el-button type="text" size="medium" class="bucket-object-link">
              <i class="fa fa-ellipsis-h"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="bucket-menu">
              <el-dropdown-item @click.native="cutObjectToBuffer(scope.row.Key)">Cut</el-dropdown-item>
              <el-dropdown-item @click.native="downloadObject(scope.row.Key.replace(prefix, ''))">Download</el-dropdown-item>
              <el-dropdown-item @click.native="renameObject(scope.row.Key.replace(prefix, ''))">Rename</el-dropdown-item>
              <el-dropdown-item @click.native="copyObjectToBuffer(scope.row.Key)">Copy</el-dropdown-item>
              <el-dropdown-item>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <el-dialog
      title="HTTP Server Settings"
      :visible.sync="httpServerSettingsVisible">
      <el-form label-width="160px">
        <el-form-item label="Enable HTTP Server">
          <el-radio-group v-model="form.enabled">
            <el-radio-button :label="true">On</el-radio-button>
            <el-radio-button :label="false">Off</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="website-link" v-if="form.enabled">
          <div>Endpoint:</div>
          <a :href="form.link" class="primary" target="_blank">{{ form.link }}</a>
          <el-button size="mini" type="primary" plain @click="copyToClipboard()">{{ copyButtonText }}</el-button>
          <input type="text" class="copy-text-input" id="copyText" :value="form.link">
        </div>

        <el-form-item label="Index document" v-if="form.enabled">
          <el-input placeholder="index.html" v-model="form.index"></el-input>
        </el-form-item>
        <el-form-item label="Error document" v-if="form.enabled">
          <el-input placeholder="error.html" v-model="form.error"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelHttpServerSettings">Cancel</el-button>
        <el-button type="primary" @click="saveHTTPServerSettings">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FileSaver from 'file-saver'
import config from '@/api'

export default {
  data () {
    return {
      form: {
        enabled: false,
        link: null,
        index: 'index.html',
        error: 'error.html'
      },
      objects: [],
      prefix: '',
      uploadDialogVisible: false,
      httpServerSettingsVisible: false,
      multipleSelection: [],
      loading: true,
      uploading: false,
      copyBuffer: [],
      cutBuffer: [],

      copyButtonText: 'Copy'
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
    copyToClipboard () {
      let copyText = document.getElementById('copyText')
      copyText.select()
      document.execCommand('Copy')
      this.copyButtonText = 'Copied'
      setTimeout(() => {
        this.copyButtonText = 'Copy'
      }, 2000)
    },

    openHttpServerSettings () {
      this.loading = true
      this.$store.dispatch('getBucketWebsite', {
        project: this.$store.getters.currentProject,
        bucket: this.$route.params.name
      }).then(response => {
        this.form.error = response.ErrorDocument.Key
        this.form.index = response.IndexDocument.Suffix
        this.form.enabled = true
      }).finally(() => {
        this.$store.dispatch('getS3Credentials', {
          project: this.$store.getters.currentProject,
          lifetime: 1
        }).then(response => {
          this.form.link = (config.API_S3_SSL_ENABLED ? 'https://' : 'http://') +
            this.$route.params.name + '.' +
            response.data.accid + '.' +
            response.data.endpoint.split(':')[0] +
            ':8080/'

          this.loading = false
          this.httpServerSettingsVisible = true
        })
      })
    },

    cancelHttpServerSettings () {
      this.httpServerSettingsVisible = false
      this.form = {
        enabled: false,
        link: null,
        index: 'index.html',
        error: 'error.html'
      }
    },

    async saveHTTPServerSettings () {
      if (this.form.enabled === true) {
        try {
          await this.$store.dispatch('deleteBucketWebsite', {
            project: this.$store.getters.currentProject,
            bucket: this.$route.params.name
          })
        } catch (err) {
          console.log(err)
        }

        this.$store.dispatch('putBucketWebsite', {
          project: this.$store.getters.currentProject,
          bucket: this.$route.params.name,
          error: this.form.error,
          index: this.form.index
        }).then(response => {
          console.log(response)
        }).finally(() => {
          this.cancelHttpServerSettings()
        })
      } else {
        this.$store.dispatch('deleteBucketWebsite', {
          project: this.$store.getters.currentProject,
          bucket: this.$route.params.name
        }).finally(() => {
          this.cancelHttpServerSettings()
        })
      }
    },

    clearBuffer () {
      this.copyBuffer = []
      this.cutBuffer = []
    },

    isCopyOrCut (objectPath) {
      return this.copyBuffer.indexOf(objectPath) >= 0 || this.cutBuffer.indexOf(objectPath) >= 0
    },

    copyObjectToBuffer (objectPath) {
      this.clearBuffer()
      this.copyBuffer.push(objectPath)
    },

    cutObjectToBuffer (objectPath) {
      this.clearBuffer()
      this.cutBuffer.push(objectPath)
    },

    copySelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.clearBuffer()

      this.multipleSelection.forEach(object => {
        this.copyBuffer.push(object.Key)
      })
    },

    cutSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.clearBuffer()

      this.multipleSelection.forEach(object => {
        this.cutBuffer.push(object.Key)
      })
    },

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

    pasteObjects () {
      if (this.copyBuffer.length > 0 || this.cutBuffer.length > 0) {
        let promises = []
        let isCopy = this.copyBuffer.length > 0
        let objects = this.copyBuffer.length > 0 ? this.copyBuffer : this.cutBuffer

        objects.forEach(objectPath => {
          let re = /(?:\/|([^/]+))?$/
          let name = re.exec(objectPath)[1]

          promises.push(
            this.$store.dispatch('copyS3Object', {
              project: this.$store.getters.currentProject,
              bucket: this.$route.params.name,
              oldPath: objectPath,
              newPath: this.prefix !== undefined ? this.prefix + name : name
            }).then(response => {
              if (isCopy) return null
              return this.$store.dispatch('deleteS3Object', {
                project: this.$store.state.projects.currentProject,
                bucket: this.$route.params.name,
                object: objectPath
              })
            })
          )
        })

        Promise.all(promises).then(result => {
          this.clearBuffer()
          return this.fetchListObjects()
        }).catch(error => {
          if (error.message) {
            this.$notify.error({
              title: 'Error',
              message: error.message
            })
          }
        })
      }
    },

    renameObject (filename) {
      this.$prompt('New name', 'Enter new name for the ' + filename, {
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        inputErrorMessage: 'Name is invalid',
        inputValue: filename
      }).then(value => {
        return this.$store.dispatch('renameS3Object', {
          project: this.$store.getters.currentProject,
          bucket: this.$route.params.name,
          oldName: filename,
          newName: value.value,
          prefix: this.prefix !== undefined ? this.prefix : ''
        })
      }).then(response => {
        return this.fetchListObjects()
      }).catch(error => {
        if (error.message) {
          this.$notify.error({
            title: 'Error',
            message: error.message
          })
        }
      })
    },

    downloadObject (filename) {
      this.$store.dispatch('getS3Object', {
        project: this.$store.getters.currentProject,
        bucket: this.$route.params.name,
        filename: filename,
        prefix: this.prefix !== undefined ? this.prefix : ''
      }).then(response => {
        var file = new File([response.Body], filename, { type: response.ContentType })
        FileSaver.saveAs(file)
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
        prefix: this.prefix !== undefined ? this.prefix : ''
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

  .bucket-object-link-dropdown {
    float: right;
    width: 32px;
    text-align: center;
  }

  .el-button.bucket-object-link,
  .el-button.bucket-object-link:hover,
  .el-button.bucket-object-link:focus {
    color: #303133;
    text-transform: none;
    padding: 0;
  }

  .buffered {
    color: #909399;
  }

  .website-link {
    margin-bottom: 20px;

    div {
      margin-bottom: 15px;
    }
  }

  .copy-text-input {
    opacity: 0;
    width: 1px;
    height: 1px;
  }
</style>
