<template>
  <div v-loading="loading">
    <p>Please add your code, test and save it here</p>

    <div class="actions-block">
        <el-button type="primary" size="medium" @click="saveAndRunFunctionCode('test')" :disabled="loading">Test</el-button>
        <el-button type="primary" size="medium" @click="saveAndRunFunctionCode()" :disabled="loading">Save</el-button>
        <div class="status-block" :class="{ success: runStatus == 'success', failed: runStatus == 'failed' }">
          <i class="fa fa-circle status-icon">
          </i>
          <span class="status-text">{{ runStatusText }}</span>
        </div>

        <div class="saved-status-block">
          <span class="ok-status-text" v-if="saved">Function saved</span>
          <span class="failed-status-text" v-if="!saved">Function not saved</span>
        </div>
    </div>

    <el-row :gutter="35">
      <el-col :xs="24" :sm="24" :md="20" :lg="20">
        <div class="custom-form-item">
          <label for="code">Code</label>
          <codemirror id="code" v-model="code" :value="code" :options="cmOptions"></codemirror>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="10" :lg="10">
        <div class="custom-form-item">
          <label for="result">
            Output
            <a href="#" @click.prevent="inputDialogVisible = true" class="change-input-action">Change Input</a>
          </label>
          <codemirror id="result" :value="result" :options="cmLogsOptions"></codemirror>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="10" :lg="10">
        <div class="custom-form-item">
          <label for="result">Logs</label>
          <codemirror id="logs" :value="logs" :options="cmLogsOptions"></codemirror>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      title="Please add your code and run it here"
      :visible.sync="inputDialogVisible"
      class="input-dialog">
      <el-form ref="form" label-position="top">
        <el-form-item label="Input">
          <codemirror id="input" v-model="argsTmp" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="inputDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveArgs">Save and close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
// language js
import 'codemirror/mode/python/python.js'
// active-line.js
import 'codemirror/addon/selection/active-line.js'

export default {
  components: { codemirror },
  data () {
    return {
      code: null,
      args: {},
      argsTmp: '',

      result: null,
      runStatus: 'nothing',
      runStatusText: 'No status',
      saved: true,
      logs: '',

      loading: true,
      inputDialogVisible: false,

      cmOptions: {
        tabSize: 4,
        indentUnit: 4,
        mode: 'text/x-python',
        theme: 'solarized light',
        lineNumbers: true,
        line: true,
        styleActiveLine: true
      },

      cmLogsOptions: {
        line: true,
        theme: 'solarized light',
        readOnly: true
      }
    }
  },

  watch: {
    code: function (newCode, oldCode) {
      if (oldCode !== null) {
        this.saved = false
      }
    }
  },

  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'code')
    this.fetchFunctionInfo().then(response => {
      if (response.data.userdata !== '') {
        this.args = JSON.parse(response.data.userdata)
        this.argsTmp = response.data.userdata
      }
      return this.fetchFunctionCode(response.data.version)
    }).then(() => {
      this.loading = false
    })
  },

  methods: {
    fetchFunctionInfo () {
      return this.$store.dispatch('fetchFunctionInfo', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name
      })
    },

    fetchFunctionCode (version) {
      return this.$store.dispatch('fetchFunctionCode', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        version: version
      }).then(response => {
        if ('code' in response.data && response.data.code !== '') {
          this.code = atob(response.data.code)
        } else {
          console.log(response)
        }
      })
    },

    setRunStatus (status, title) {
      this.runStatus = status
      this.runStatusText = title
    },

    saveAndRunFunctionCode (project) {
      this.loading = true
      project = (project || this.$store.getters.currentProject)
      console.log(project)

      this.$store.dispatch(project === 'test' ? 'updateTestFunction' : 'updateFunction', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        code: btoa(this.code),
        userdata: JSON.stringify(this.args)
      }).then(response => {
        this.saved = (project === 'test' ? this.saved : true)
        return this.$store.dispatch(project === 'test' ? 'fetchTestFunctionInfo' : 'fetchFunctionInfo', {
          project: this.$store.getters.currentProject,
          name: this.$route.params.name
        })
      }).then(response => {
        if (project === 'test') {
          return this.$store.dispatch('waitTestFunction', {
            project: this.$store.getters.currentProject,
            name: this.$route.params.name,
            timeout: 30000,
            version: response.data.version
          })
        } else { console.log('test1') }
      }).then(response => {
        if (project === 'test') {
          return this.$store.dispatch('runTestFunction', {
            project: this.$store.getters.currentProject,
            name: this.$route.params.name,
            args: this.args
          })
        } else { console.log('test2') }
      }).then(response => {
        if (project === 'default') {
          console.log('defaul project')
        } else {
          this.logs = '------ stdout -----\n' +
                      (response.data.stdout || 'None') +
                      '\n------ stderr -----\n' +
                      (response.data.stderr || 'None')

          this.result = response.data.return

          if (response.data.code === 0) {
            this.setRunStatus('success', 'Success')
          } else {
            this.setRunStatus('failed', 'Failed')
          }
        }
      }).catch(error => {
        this.setRunStatus('failed', 'Failed')
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      }).finally(() => {
        this.loading = false
      })
    },

    saveArgs () {
      this.args = JSON.parse(this.argsTmp)
      this.inputDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.status-block {
  display: inline-block;
  margin-left: 10px;

  .status-icon {
    color: #dcdfe6;
  }

  .status-text {
    color: #303133;;
    margin-left: 10px;
  }

  &.success {
    .status-icon {
      color: #67c23a;
    }
  }

  &.failed {
    .status-icon {
      color: #d0021b;
    }
  }
}

.saved-status-block {
  display: inline-block;
  margin-left: 80px;
  text-transform: uppercase;

  .ok-status-text {
    color: #67c23a;
  }

  .failed-status-text {
    color: #d0021b;
  }
}

.custom-form-item {
  label {
    display: block;
    padding: 15px 0;

    .change-input-action {
      float: right;
    }
  }
}
</style>
