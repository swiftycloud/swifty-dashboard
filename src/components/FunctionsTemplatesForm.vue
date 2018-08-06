<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="functions-templates-form" v-loading="loading">
    <el-form ref="functionForm" label-width="160px" :model="form" :rules="rules">
      <span v-if="step === 1">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="18" :md="14" :lg="10">
            <el-form-item label="Select repository">
              <el-select placeholder="Please select repository" style="width: 100%" v-model="repoId">
                <el-option v-for="repo in repos" :label="repo.url" :value="repo.id" :key="repo.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6" :md="10" :lg="14">
            <el-form-item label-width="0">
              <el-button type="primary" plain @click="syncRepo" :loading="syncLoading">Sync Repo</el-button>
            </el-form-item>
          </el-col>
        </el-row>
    
        <span v-if="withDesc">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="10" :md="8" :lg="6">
              <el-form-item label-width="0">
                <el-input placeholder="Search" v-model="templateSearch"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6" :lg="4">          
              <el-form-item label-width="0">
                <el-select placeholder="Please select language" v-model="form.code.lang" style="width: 100%">
                  <el-option
                    v-for="(lang, k) in $store.getters.getFunctionLangs"
                    :label="lang"
                    :value="lang"
                    :key="k">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="template-radio-block">
            <el-col :xs="24" :sm="24" :md="12" :lg="10" v-for="template in filteredTemplates" :key="template.name">
              <el-radio v-model="selectedTemplate" :label="template" border>
                <p class="title">{{ template.name }}</p>
                <p class="description">{{ template.desc }}</p>
              </el-radio>
            </el-col>
          </el-row>

          <el-row v-if="filteredTemplates.length > 4">
            <el-col :span="24">
              <el-pagination
                :page-size="20"
                :pager-count="11"
                layout="prev, pager, next"
                :total="1000">
              </el-pagination>
            </el-col>
          </el-row>
        </span>

        <span v-if="!withDesc && files.length">
          <el-row>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <p>Template description is not available for this repo. Please select the file.</p>

              <el-tree :data="files" @node-click="selectFile" class="files-tree" node-key="path">
                <span slot-scope="{ node, data }">
                  <span v-if="data.type === 'dir'">
                    <i class="fa fa-folder"></i> {{ data.label }}
                  </span>
                  <span v-if="data.type === 'file'" :class="{ selected: data.path === selectedTemplate }">
                    <i class="fa fa-file-code-o"></i> {{ data.label }}
                  </span>
                </span>
              </el-tree>
            </el-col>
          </el-row>  
        </span>

        <el-row>
          <el-col :span="24">
            <br>
            <el-button @click="$router.push({ name: 'functions' })">Cancel</el-button>
            <el-button type="primary" class="create-function-button" @click="nextForm" :disabled="!this.selectedTemplate">
              Next
            </el-button>
          </el-col>
        </el-row>
      </span>
      <span v-if="step === 2">
        <el-row>
          <el-col :xs="24" :sm="24" :md="18" :lg="18">
            <p>Review function code</p>

            <pre class="review-code">{{ previewCode }}</pre>

            <el-form-item label label-width="0">
              <el-checkbox label="Sync with repository" v-model="form.sources.sync"></el-checkbox>
              <el-popover
                ref="sync"
                placement="right"
                title="Function sync"
                width="400"
                trigger="hover">
                You need to configure web hooks for your repository for Swifty to be able automatically update your functions <br><a href='#' class="primary">More details</a>

                <span class="fa-stack mirror-info" slot="reference">
                  <i class="fa fa-circle-thin fa-stack-2x"></i>
                  <i class="fa fa-info fa-stack-1x"></i>
                </span>
              </el-popover>
            </el-form-item>

            <el-form-item label="Language" prop="code.lang">
              <el-select placeholder="Please select language" v-model="form.code.lang" style="width: 100%">
                <el-option
                  v-for="(lang, k) in $store.getters.getFunctionLangs"
                  :label="lang"
                  :value="lang"
                  :key="k">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="Name" prop="name">
              <el-input v-model="form.name" :autofocus="true"></el-input>
            </el-form-item>

            <el-button @click="step = 1">Back</el-button>
            <el-button type="primary" class="create-function-button" @click="createFunction">
              Create
            </el-button>
          </el-col>
        </el-row>
      </span>
    </el-form>
  </div>
</template>

<script>
import Repo from '@/models/Repository'
import api from '@/api'

export default {
  data () {
    var validateFunctionName = (rule, value, callback) => {
      if (/^[A-z0-9_]+$/.test(value) === false) {
        callback(new Error('Please input correct function name'))
      } else {
        callback()
      }
    }

    return {
      form: {
        project: this.$store.getters.currentProject,
        name: null,
        sources: { type: 'git', repo: null, sync: false },
        code: { lang: 'python' },
        event: { source: 'url' },
        userdata: ''
      },
      withDesc: false,
      files: [],
      repoId: null,
      selectedTemplate: {
        path: null,
        name: null
      },
      previewCode: null,
      repos: [],
      step: 1,
      templates: [],
      templateSearch: '',

      syncLoading: false,
      loading: false,

      rules: {
        name: [
          { required: true, message: 'Please enter function name', trigger: 'blur' },
          { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
          { validator: validateFunctionName, trigger: 'blur' }
        ],
        code: {
          lang: [
            { required: true, message: 'Please select function language', trigger: 'blur' }
          ]
        }
      }
    }
  },

  created () {
    Repo.params({
      attached: true
    }).get().then(repos => {
      this.repos = repos
    })
  },

  watch: {
    'repoId': function (rid) {
      api.repos.one(rid).desc().then(response => {
        this.templates = response.data
        this.withDesc = true
      }).catch(() => {
        this.withDesc = false
        this.fetchFilesByRepo(rid)
      })
    }
  },

  computed: {
    filteredTemplates () {
      return this.templates.files.filter(file => {
        return (file.name.toLowerCase().includes(this.templateSearch.toLowerCase()) ||
          file.desc.toLowerCase().includes(this.templateSearch.toLowerCase())) &&
          file.lang === this.form.code.lang
      })
    },

    repoWithFile () {
      return this.repoId + '/' + this.selectedTemplate.path
    }
  },

  methods: {
    fetchFilesByRepo (rid) {
      this.selectedTemplate.path = null
      api.repos.one(rid).files.get().then(response => {
        this.files = response.data
      })
    },

    selectFile (data) {
      if (data.type === 'file') {
        if (this.selectedTemplate.path === data.path) {
          this.selectedTemplate.path = null
        } else {
          this.selectedTemplate.path = data.path
          this.form.code.lang = data.lang
        }
      }
    },

    nextForm () {
      api.repos.one(this.repoId).files.find(this.selectedTemplate.path).then(response => {
        this.previewCode = response.data
        this.step = 2
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Template error'
        })
      })
    },

    syncRepo () {
      this.syncLoading = true

      api.repos.one(this.repoId).pull().then(response => {
        return this.fetchFilesByRepo(this.repoId)
      }).finally(() => {
        this.syncLoading = false
      })
    },

    createFunction () {
      this.form.sources.repo = this.repoId + '/' + this.selectedTemplate.path

      this.$refs.functionForm.validate((valid) => {
        if (valid) {
          this.$store.dispatch('createFunction', this.form).then(response => {
            this.$router.push({ name: 'functions.view.code', params: { fid: response.data.id } })
          }).catch((error) => {
            this.form.project = this.$store.getters.project
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Function creating was failed'
            })
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.functions-templates-form {
  margin-top: 20px;
}

.template-radio-block {
  margin-bottom: 10px;
  //width: 900px;
}

.el-radio.is-bordered {
  height: 122px !important;
  width: 100%;
  display: table;
  background: white;
  padding: 0 20px !important;
  margin: 10px 0;

  .el-radio__input,
  .el-radio__label {
    display: table-cell;
    vertical-align: middle;
  }

  .el-radio__input {
    width: 14px;
  }

  .el-radio__label {
    white-space: normal;
    padding: 22px 0 22px 20px;

    .title {
      font-size: 16px;
      color: #606266;
      margin-bottom: 13px;
    }

    .description {
      font-size: 14px;
      color: #909399;
      line-height: 1.71;
      margin-bottom: 0;
    }
  }
}

.files-tree {
  border-radius: 4px;
  border: solid 1px #dcdfe6;
  padding: 10px 0;

  overflow-y: auto;
  max-height: 200px;

  .selected {
    color: #0486fe;
  }
}

.review-code {
  border-radius: 4px;
  border: solid 1px #dcdfe6;
  padding: 10px;  

  overflow-y: auto;
  max-height: 350px;
}
</style>