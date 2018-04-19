<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="openCreateTriggerDialog">Add Trigger</el-button>
    </div>

    <hr>

    <el-row v-if="url">
      <el-col :span="12">
        <p class="trigger-post-url-label">REST API</p>
      </el-col>
      <!--<el-col :span="12">
        <el-button type="primary" plain size="medium">Disable API</el-button>
      </el-col>-->
    </el-row>

    <el-row v-if="url">
      <el-col :span="24">
        <p class="trigger-post-url">POST https://{{ url }}  <el-button size="mini" type="primary" v-clipboard:copy="'https://' + url" class="fa fa-copy" plain></el-button></p>
      </el-col>
    </el-row>

    <el-table
      :data="cron"
      style="width: 100%">
      <div slot="empty" class="middleware-empty-message">
          <p>You don’t have any triggers attached to the function</p>
          <el-button type="primary" size="mini" round @click="triggerCreationDialog = true">Attach</el-button>
      </div>
      <el-table-column
        prop="tab"
        label="Expression"
        sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.tab }}</span>
          <el-dropdown 
            trigger="click" 
            placement="bottom-start"
            class="trigger-link-dropdown">
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
        prop="args"
        label="JSON Workload"
        sortable>
        <template slot-scope="scope">
          <code>{{ JSON.stringify(scope.row.args) }}</code>
        </template>
      </el-table-column>
      <el-table-column
        label="Type"
        sortable>
        <template slot-scope="scope">
          cron
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Create new scheduled trigger"
      :visible.sync="triggerCreationDialog"
      width="600px">
      <el-form v-model="form" @submit="submitCreateTriggerForm">
        <el-form-item label="Trigger name" label-width="120px">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="timerSettingValue">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="timerSettingValue == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="form.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="form.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="form.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="form.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerCreationDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitCreateTriggerForm">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Edit scheduled trigger"
      :visible.sync="triggerEditionDialog"
      width="600px">
      <el-form v-model="form" @submit="submitEditTriggerForm">
        <el-form-item label="Trigger name" label-width="120px">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="timerSettingValue">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="timerSettingValue == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="form.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="form.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="form.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="form.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerEditionDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitEditTriggerForm">Save</el-button>
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
      triggerCreationDialog: false,
      triggerEditionDialog: false,
      timerSettingValue: 'Visual',
      form: {
        id: null,
        name: null,
        weekdays: [],
        time: null,
        expression: '* * * * * *',
        json: ''
      },
      cron: [],
      url: null,
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
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'triggers')
    this.fetchTriggerList()
  },
  methods: {
    updateExpression () {
      let expr = this.form.expression.split(' ')

      let time = this.form.time !== null ? this.form.time.split(':') : ['*', '*']

      let min = parseInt(time[1]) >= 0 ? parseInt(time[1]) : '*'
      let hour = parseInt(time[0]) >= 0 ? parseInt(time[0]) : '*'

      let weekdays = this.form.weekdays.length ? this.form.weekdays.join(',') : ['*']

      this.form.expression = [min, hour, expr[2], expr[3], weekdays, expr[5]].join(' ')
    },

    updateFormByExpr (newVal) {
      let expr = newVal.split(' ')

      if (parseInt(expr[0]) >= 0 && parseInt(expr[1]) >= 0) {
        this.form.time = parseInt(expr[1]) + ':' + parseInt(expr[0])
      } else {
        this.form.time = null
      }

      if (parseInt(expr[4]) >= 0) {
        var weekdays = expr[4].split(',')
        for (var k in weekdays) {
          if (parseInt(weekdays[k]) >= 0) {
            weekdays[k] = parseInt(weekdays[k])
          }
        }

        this.form.weekdays = weekdays
      }
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    resetForm () {
      this.timerSettingValue = 'Visual'
      this.form = {
        id: null,
        name: null,
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
      this.form.id = scope.row.id
      this.form.json = JSON.stringify(scope.row.args)
      this.form.expression = scope.row.tab
      this.updateFormByExpr(scope.row.tab)

      this.triggerEditionDialog = true
    },

    openCreateTriggerDialog () {
      this.resetForm()
      this.triggerCreationDialog = true
    },

    submitEditTriggerForm () {
      if (this.timerSettingValue === 'Visual') {
        this.updateExpression()
      }

      var args = {}
      try {
        args = JSON.parse(this.form.json)
      } catch (e) {}

      for (var k in this.cron) {
        if (this.cron[k].id === this.form.id) {
          this.cron[k].tab = this.form.expression
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
        this.triggerEditionDialog = false
        return this.fetchTriggerList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    },

    submitCreateTriggerForm () {
      if (this.timerSettingValue === 'Visual') {
        this.updateExpression()
      }

      var args = {}
      try {
        args = JSON.parse(this.form.json)
      } catch (e) {}

      this.cron.push({
        id: this.cron.length + 1,
        tab: this.form.expression,
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
        this.triggerCreationDialog = false
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
      this.$store.dispatch('fetchFunctionInfo', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name
      }).then(response => {
        this.url = response.data.url
        if (response.data.event !== undefined && response.data.event.cron !== undefined) {
          this.cron = []
          for (var k in response.data.event.cron) {
            this.cron.push({
              id: k,
              ...response.data.event.cron[k]
            })
          }
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
