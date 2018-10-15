<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div v-loading="loading">
    <p>Please add your code, test and save it here</p>

    <div class="actions-block">
        <el-button type="primary" size="medium" @click="testFunctionCode" :disabled="loading">Test</el-button>
        <el-button type="primary" size="medium" @click="saveFunctionCode" :disabled="loading || sync">Save</el-button>
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
        <el-alert
          title
          type="success"
          show-icon
          :closable="false"
          v-if="sync">
          This function automatically update from the upstream repository every hour.
          <a href="#" @click.prevent="stopCodeSync">Stop syncronization</a>
        </el-alert>

        <div class="custom-form-item">
          <label for="code">Code <span v-if="sync">(stop syncronization to edit code here)</span></label>
          <pre class="review-code" v-if="sync">{{ code }}</pre>
          <codemirror id="code" v-model="code" :value="code" :options="cmOptions" v-else></codemirror>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="10" :lg="10">
        <div class="custom-form-item">
          <label for="result">
            Output
            <a href="#" @click.prevent="openInputDialog" class="change-input-action">Change Input</a>
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
        <el-form-item label style="margin-bottom: 0">
          <el-col :span="9">
            <div style="text-align: center"><strong>Key</strong></div>
          </el-col>
          <el-col :span="1">
            <div style="text-align: center">&nbsp;</div>
          </el-col>
          <el-col :span="9">
            <div style="text-align: center"><strong>Value</strong></div>
          </el-col>
        </el-form-item>
        <el-form-item label v-for="arg, k in argsTmp" :key="k">
          <el-col :span="9">
            <el-input :value="arg.name"></el-input>
          </el-col>
          <el-col :span="1">
            <div style="text-align: center">=</div>
          </el-col>
          <el-col :span="9">
            <el-input :value="arg.value"></el-input>
          </el-col>
          <el-col :span="5" style="text-align: center">
            <el-button type="danger" plain @click="removeArg(k)">Remove</el-button>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="inputDialogVisible = false">Cancel</el-button>
        <el-button type="primary" plain @click="addArgsParam">Add param</el-button>
        <el-button type="primary" @click="saveArgs">Save and close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'
import { mapActions } from 'vuex'

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/addon/selection/active-line.js'

export default {
  components: { codemirror },
  data () {
    return {
      sync: false,
      code: null,
      args: [],
      argsTmp: [],

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
    this.setParentPage({ name: 'functions', title: 'Functions' })
    this.setFunctionActiveTab('code')

    this.fetchFunctionByID(this.$route.params.fid).then(response => {
      if ('userdata' in response.data && response.data.userdata !== '') {
        let tmp = JSON.parse(response.data.userdata)
        for (let key in tmp) {
          let data = { name: key, value: tmp[key] }
          let value = tmp[key]
          if (typeof data.value === 'object') {
            data.value = JSON.stringify(value)
          }

          this.args.push(data)
        }
      }
      return this.fetchFunctionCode()
    }).then(response => {
      this.loading = false
    })
  },

  methods: {
    ...mapActions([
      'setParentPage',
      'setFunctionActiveTab',
      'fetchFunctionByID',
      'fetchFunctionSourcesByID',
      'findTestFunctionByID',
      'updateFunctionSources',
      'runFunctionCode',
      'waitFunctionVersion',
      'getFunctionByID',
      'updateFunction'
    ]),

    fetchFunctionInfo () {
      return this.$store.dispatch('fetchFunctionInfo', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name
      })
    },

    fetchFunctionCode () {
      return this.fetchFunctionSourcesByID(this.$route.params.fid).then(response => {
        if ('code' in response.data && response.data.code !== '') {
          this.code = atob(response.data.code)
          this.sync = response.data.sync
        }
      })
    },

    setRunStatus (status, title) {
      this.runStatus = status
      this.runStatusText = title
    },

    testFunctionCode () {
      this.loading = true

      let args = {}
      this.args.forEach(item => {
        args[item.name] = item.value.toString()
      })

      api.functions.one(this.$route.params.fid).run({
        args: args,
        src: {
          type: 'code',
          code: btoa(this.code)
        }
      }).then(response => {
        // show logs
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

    saveFunctionCode () {
      this.loading = true

      this.updateFunctionSources({
        fid: this.$route.params.fid,
        data: {
          type: 'code',
          code: btoa(this.code),
          sync: this.sync
        }
      }).then(response => {
        return this.updateFunction({
          fid: this.$route.params.fid,
          data: {
            userdata: JSON.stringify(this.args)
          }
        })
      }).then(response => {
        this.saved = true
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

    stopCodeSync () {
      this.$confirm('Are you sure about that?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        this.loading = true
        return this.updateFunctionSources({
          fid: this.$route.params.fid,
          data: {
            type: 'code',
            code: btoa(this.code),
            sync: false
          }
        })
      }).then(() => {
        return this.fetchFunctionCode()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      }).finally(() => {
        this.loading = false
      })
    },

    openInputDialog () {
      this.argsTmp = [ ...this.args ]
      this.inputDialogVisible = true
    },

    saveArgs () {
      this.args = [ ...this.argsTmp ]
      this.inputDialogVisible = false
    },

    removeArg (k) {
      delete this.argsTmp[k]

      let newArgs = []
      for (let i in this.argsTmp) {
        if (this.argsTmp[i] !== undefined) {
          newArgs.push(this.argsTmp[i])
        }
      }

      this.argsTmp = [ ...newArgs ]
    },

    addArgsParam () {
      this.argsTmp.push({ name: '', value: '' })
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

.sync-container {
  margin-top: 10px;
}

.review-code {
  border-radius: 4px;
  border: solid 1px #dcdfe6;
  padding: 10px;
  margin-top: 0;

  overflow-y: auto;
  max-height: 300px;
}
</style>
