<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button type="primary" size="medium">Add Trigger <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :disabled="urlTriggerCreatingDisabled" @click.native="addUrlTrigger">REST API (URL)</el-dropdown-item>
          <el-dropdown-item :disabled="cronTriggerCreatingDisabled" @click.native="openAddCronTrigger">Scheduled Action</el-dropdown-item>
          <el-dropdown-item :disabled="s3TriggerCreatingDisabled" @click.native="triggerS3CreationDialog = true">Object Storage</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <hr>

    <el-table
      :data="triggers"
      style="width: 100%">
      <el-table-column
        prop="name"
        label="Name"
        sortable
        width="250px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
          <el-dropdown 
            trigger="click" 
            placement="bottom-start"
            class="trigger-link-dropdown"
            v-if="scope.row.type === 'cron'">
            <el-button type="text" size="medium" class="trigger-link">
              <i class="fa fa-ellipsis-h"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="trigger-menu">
              <el-dropdown-item @click.native="openEditTriggerDialog(scope)">Edit Trigger</el-dropdown-item>
              <el-dropdown-item @click.native="deleteTrigger(scope)">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="Type"
        sortable
        width="200px">
      </el-table-column>
      <el-table-column
        prop="data"
        label="Data"
        sortable>
        <template slot-scope="scope">
          <code v-if="scope.row.type === 'cron'">{{ JSON.stringify(scope.row.data) }}</code>
          <span v-else>{{ scope.row.data }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Create new object storage trigger"
      :visible.sync="triggerS3CreationDialog"
      width="600px">
      <el-form v-model="cronForm" @submit="submitCreateS3TriggerForm">
        <el-form-item label="Bucket" label-width="120px">
          <el-select v-model="s3Form.bucket" placeholder="Select bucket" style="width: 450px">
            <el-option v-for="(bucket, k) in $store.getters.getS3Buckets" :key="k" :value="bucket.Name" :label="bucket.Name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Event type" label-width="120px">
          <el-select multiple v-model="s3Form.eventTypes" placeholder="Select event type" style="width: 450px">
            <el-option value="put" label="Object Created - PUT"></el-option>
            <el-option value="delete" label="Object Deleted - DELETE"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Path to object" label-width="120px">
          <el-input v-model="s3Form.pathToObject" placeholder="folder1/"></el-input>
        </el-form-item>

        <el-form-item label="Filter" label-width="120px">
          <el-input v-model="s3Form.filter" placeholder="*.img"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerS3CreationDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitCreateS3TriggerForm">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create new scheduled trigger"
      :visible.sync="triggerCronCreationDialog"
      width="600px">
      <el-form v-model="cronForm" @submit="submitCreateCronTriggerForm">
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="timerSettingValue">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="timerSettingValue == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="cronForm.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="cronForm.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="cronForm.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="cronForm.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerCronCreationDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitCreateCronTriggerForm">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Edit scheduled trigger"
      :visible.sync="triggerCronEditionDialog"
      width="600px">
      <el-form v-model="cronForm" @submit="submitEditCronTriggerForm">
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="timerSettingValue">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="timerSettingValue == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="cronForm.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="cronForm.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="cronForm.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="cronForm.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerCronEditionDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitEditCronTriggerForm">Save</el-button>
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
      triggerCronCreationDialog: false,
      triggerCronEditionDialog: false,
      triggerS3CreationDialog: false,
      timerSettingValue: 'Visual',
      cronForm: {
        id: null,
        weekdays: [],
        time: null,
        expression: '* * * * * *',
        json: ''
      },
      s3Form: {
        bucket: null,
        eventTypes: [],
        pathToObject: null,
        filter: null
      },
      cron: [],
      triggers: [],
      triggersSource: null,
      loading: true,
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      times: { start: '00:00', step: '00:15', end: '23:45' },
      cmOptions: {
        tabSize: 4,
        indentUnit: 4,
        mode: 'text/x-python',
        theme: 'solarized light',
        lineNumbers: true,
        line: true,
        styleActiveLine: true
      }
    }
  },
  computed: {
    urlTriggerCreatingDisabled: function () {
      if (this.triggers.length === 0) {
        return false
      }

      return true
    },
    s3TriggerCreatingDisabled: function () {
      if (this.triggersSource === 'url' || this.triggersSource === 's3' || this.triggers.length === 0) {
        return false
      }

      return true
    },
    cronTriggerCreatingDisabled: function () {
      if (this.triggersSource === 'url' || this.triggersSource === 'cron' || this.triggers.length === 0) {
        return false
      }

      return true
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'triggers')
    this.fetchTriggerList()
    this.$store.dispatch('fetchS3ListBuckets', {
      project: this.$store.getters.currentProject
    })
  },
  methods: {
    updateExpression () {
      let expr = this.cronForm.expression.split(' ')

      let time = this.cronForm.time !== null ? this.cronForm.time.split(':') : ['*', '*']

      let min = parseInt(time[1]) >= 0 ? parseInt(time[1]) : '*'
      let hour = parseInt(time[0]) >= 0 ? parseInt(time[0]) : '*'

      let weekdays = this.cronForm.weekdays.length ? this.cronForm.weekdays.join(',') : ['*']

      this.cronForm.expression = [min, hour, expr[2], expr[3], weekdays, expr[5]].join(' ')
    },

    updateFormByExpr (newVal) {
      let expr = newVal.split(' ')

      if (parseInt(expr[0]) >= 0 && parseInt(expr[1]) >= 0) {
        this.cronForm.time = parseInt(expr[1]) + ':' + parseInt(expr[0])
      } else {
        this.cronForm.time = null
      }

      if (parseInt(expr[4]) >= 0) {
        var weekdays = expr[4].split(',')
        for (var k in weekdays) {
          if (parseInt(weekdays[k]) >= 0) {
            weekdays[k] = parseInt(weekdays[k])
          }
        }

        this.cronForm.weekdays = weekdays
      }
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    resetForm () {
      this.timerSettingValue = 'Visual'
      this.cronForm = {
        id: null,
        weekdays: [],
        time: null,
        expression: '* * * * * *',
        json: ''
      }
    },

    deleteTrigger (scope) {
      this.$confirm('Trigger will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        for (var k in this.cron) {
          if (this.cron[k].id === scope.row.id) {
            this.cron.splice(k, 1)
          }
        }

        return this.$store.dispatch('updateFunction', {
          project: this.$store.getters.currentProject,
          name: this.$route.params.name,
          event: {
            source: 'cron',
            cron: this.cron
          }
        })
      }).then(response => {
        return this.fetchTriggerList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      }).finally(() => {
        this.loading = false
      })
    },

    openEditTriggerDialog (scope) {
      this.resetForm()
      this.cronForm.id = scope.row.id
      this.cronForm.json = JSON.stringify(scope.row.data)
      this.cronForm.expression = scope.row.name
      this.updateFormByExpr(scope.row.name)

      this.triggerCronEditionDialog = true
    },

    openAddCronTrigger () {
      this.resetForm()
      this.triggerCronCreationDialog = true
    },

    submitEditCronTriggerForm () {
      if (this.timerSettingValue === 'Visual') {
        this.updateExpression()
      }

      var args = {}
      try {
        args = JSON.parse(this.cronForm.json)
      } catch (e) {}

      for (var k in this.cron) {
        if (this.cron[k].id === this.cronForm.id) {
          this.cron[k].tab = this.cronForm.expression
          this.cron[k].args = args
        }
      }

      this.$store.dispatch('updateFunction', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        event: {
          source: 'cron',
          cron: this.cron
        }
      }).then(response => {
        this.triggerCronEditionDialog = false
        return this.fetchTriggerList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    },

    submitCreateCronTriggerForm () {
      if (this.timerSettingValue === 'Visual') {
        this.updateExpression()
      }

      var args = {}
      try {
        args = JSON.parse(this.cronForm.json)
      } catch (e) {}

      this.cron.push({
        id: this.cron.length + 1,
        tab: this.cronForm.expression,
        args: args
      })

      this.$store.dispatch('updateFunction', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        event: {
          source: 'cron',
          cron: this.cron
        }
      }).then(response => {
        this.triggerCronCreationDialog = false
        return this.fetchTriggerList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    },

    submitCreateS3TriggerForm () {
      this.triggerS3CreationDialog = false
    },

    addUrlTrigger () {
      this.$store.dispatch('updateFunction', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        event: {
          source: 'url'
        }
      }).then(response => {
        return this.fetchTriggerList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    },

    fetchTriggerList () {
      this.loading = true
      this.triggers = []

      this.$store.dispatch('fetchFunctionInfo', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name
      }).then(response => {
        this.triggersSource = response.data.event.source

        if (response.data.event !== undefined && response.data.event.source === 'cron' && response.data.event.cron !== undefined) {
          this.cron = []
          for (var k in response.data.event.cron) {
            this.cron.push({
              id: k,
              ...response.data.event.cron[k]
            })

            this.triggers.push({
              id: k,
              name: response.data.event.cron[k].tab,
              type: 'cron',
              data: response.data.event.cron[k].args
            })
          }
        } else if (response.data.event !== undefined && response.data.event.source === 'url') {
          this.triggers.push({
            name: 'REST API (URL)',
            type: 'url',
            data: 'POST https://' + response.data.url
          })
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss">
.trigger-post-url-label {
  line-height: 36px;
}
.trigger-post-url {
  color: #909399;
  font-size: 14px;
}
.el-dialog__footer {
  text-align: left !important;
}

.trigger-menu {
  min-width: 224px !important;
}

.trigger-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.trigger-link, 
.trigger-link:hover,
.trigger-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0;
}
</style>
