<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button type="primary" size="medium">Add Trigger <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>REST API (URL)</el-dropdown-item>
          <el-dropdown-item @click.native="openCronCreationDialog">Scheduled Action</el-dropdown-item>
          <el-dropdown-item>Object Storage</el-dropdown-item>
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
            v-if="scope.row.source === 'cron'">
            <el-button type="text" size="medium" class="trigger-link">
              <i class="fa fa-ellipsis-h"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="trigger-menu">
              <el-dropdown-item @click.native="openCronEditionDialog(scope.row.id)">Edit Trigger</el-dropdown-item>
              <el-dropdown-item @click.native="deleteEventTrigger(scope.row.id)">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column
        prop="source"
        label="Type"
        sortable
        width="200px">
      </el-table-column>
      <el-table-column
        prop="data"
        label="Data"
        sortable>
        <template slot-scope="scope">
          <code v-if="scope.row.source === 'cron'">{{ scope.row.cron.tab }}</code>
          <span v-else>{{ scope.row.data }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Create new scheduled trigger"
      :visible.sync="dialogCronCreationVisibility"
      width="600px">
      <el-form ref="cronCreationForm" :model="forms.cron" :rules="formRules.cron" @submit="createCronEventTrigger">
        <el-form-item label="Trigger name" label-width="120px" prop="name">
          <el-input v-model="forms.cron.name" placeholder="cron1"></el-input>
        </el-form-item>
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="forms.cron.formType">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="forms.cron.formType == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="forms.cron.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="forms.cron.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="forms.cron.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="forms.cron.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCronCreationVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="createCronEventTrigger">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Edit scheduled trigger"
      :visible.sync="dialogCronEditionVisibility"
      width="600px">
      <el-form ref="cronEditionForm" :model="forms.cron" :rules="formRules.cron" @submit="updateCronEventTrigger">
        <el-form-item label="Trigger name" label-width="120px" prop="name">
          <el-input v-model="forms.cron.name" placeholder="cron1"></el-input>
        </el-form-item>
        <el-form-item label="Timer settings" label-width="120px">
          <el-radio-group v-model="forms.cron.formType">
            <el-radio-button label="Visual"></el-radio-button>
            <el-radio-button label="Cron"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <hr>
        <span v-if="forms.cron.formType == 'Visual'">
          <el-form-item label="Select weekdays" label-width="120px">
            <el-select multiple v-model="forms.cron.weekdays" placeholder="Select weekdays" style="width: 450px">
              <el-option v-for="(day, key) in weekdays" :key="key" :value="key" :label="day"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Select time" label-width="120px">
            <el-time-select
              v-model="forms.cron.time"
              :picker-options="times"
              placeholder="Select time">
            </el-time-select>
          </el-form-item>
        </span>
        <span v-else>
          <el-form-item label="Cron expression" label-width="120px">
            <el-input v-model="forms.cron.expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <br>
          <codemirror id="input" v-model="forms.cron.json" :options="cmOptions"></codemirror>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCronEditionVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="updateCronEventTrigger">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/addon/selection/active-line.js'

export default {
  components: { codemirror },
  data () {
    return {
      loading: true,
      dialogCronCreationVisibility: false,
      dialogCronEditionVisibility: false,
      currentFunctionId: null,

      triggers: [],

      forms: {
        cron: {
          id: null,
          formType: 'Visual',
          name: null,
          weekdays: [],
          time: null,
          expression: '* * * * * *',
          json: ''
        },
        s3: {
          bucket: null,
          events: [],
          path: null,
          filter: null
        }
      },

      formRules: {
        cron: {
          name: [
            { required: true, message: 'Please enter trigger name', trigger: 'blur' },
            { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' }
          ]
        }
      },

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

    this.fetchEventTriggers()
  },

  methods: {
    fetchEventTriggers () {
      this.loading = true
      this.$store.dispatch('fetchFunctionInfo', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name
      }).then(response => {
        this.currentFunctionId = response.data.id
        return api.functions.one(this.currentFunctionId).triggers.get()
      }).then(response => {
        this.triggers = response.data
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },

    updateExpression () {
      let time = this.forms.cron.time !== null ? this.forms.cron.time.split(':') : ['*', '*']
      let min = parseInt(time[1]) >= 0 ? parseInt(time[1]) : '*'
      let hour = parseInt(time[0]) >= 0 ? parseInt(time[0]) : '*'
      let weekdays = this.forms.cron.weekdays.length ? this.forms.cron.weekdays.join(',') : ['*']
      this.forms.cron.expression = [min, hour, '*', '*', weekdays, '*'].join(' ')
    },

    updateFormByExpr (newVal) {
      let expr = newVal.split(' ')
      if (parseInt(expr[0]) >= 0 && parseInt(expr[1]) >= 0) {
        this.forms.cron.time = parseInt(expr[1]) + ':' + parseInt(expr[0])
      } else {
        this.forms.cron.time = null
      }
      if (parseInt(expr[4]) >= 0) {
        var weekdays = expr[4].split(',')
        for (var k in weekdays) {
          if (parseInt(weekdays[k]) >= 0) {
            weekdays[k] = parseInt(weekdays[k])
          }
        }
        this.forms.cron.weekdays = weekdays
      }
    },

    resetForms () {
      this.forms = {
        cron: {
          id: null,
          formType: 'Visual',
          name: null,
          weekdays: [],
          time: null,
          expression: '* * * * * *',
          json: ''
        },
        s3: {
          bucket: null,
          events: [],
          path: null,
          filter: null
        }
      }
    },

    openCronCreationDialog () {
      this.resetForms()
      this.dialogCronCreationVisibility = true
    },

    openCronEditionDialog (id) {
      this.resetForms()
      this.forms.cron.id = id

      api.functions.one(this.currentFunctionId).triggers.find(id).then(response => {
        this.forms.cron.formType = 'Cron'
        this.forms.cron.name = response.data.name
        this.forms.cron.expression = response.data.cron.tab
        this.forms.cron.json = JSON.stringify(response.data.cron.args)

        this.updateFormByExpr(this.forms.cron.expression)

        this.dialogCronEditionVisibility = true
      }).catch(() => {
        this.$notify.error({
          title: 'Error',
          message: 'Something wrong'
        })
      })
    },

    createCronEventTrigger () {
      this.$refs.cronCreationForm.validate(valid => {
        if (valid) {
          if (this.forms.cron.formType === 'Visual') {
            this.updateExpression()
          }

          var args = {}
          try {
            args = JSON.parse(this.forms.cron.json)
          } catch (e) {}

          api.functions.one(this.currentFunctionId).triggers.create({
            name: this.forms.cron.name,
            source: 'cron',
            cron: {
              tab: this.forms.cron.expression,
              args: args
            }
          }).then(response => {
            this.dialogCronCreationVisibility = false
            this.fetchEventTriggers()
          })
        }
      })
    },

    updateCronEventTrigger () {
      this.$refs.cronEditionForm.validate(valid => {
        if (valid) {
          if (this.forms.cron.formType === 'Visual') {
            this.updateExpression()
          }

          var args = {}
          try {
            args = JSON.parse(this.forms.cron.json)
          } catch (e) {}

          api.functions.one(this.currentFunctionId).triggers.update(this.forms.cron.id, {
            name: this.forms.cron.name,
            source: 'cron',
            cron: {
              tab: this.forms.cron.expression,
              args: args
            }
          }).then(response => {
            this.dialogCronEditionVisibility = false
            this.fetchEventTriggers()
          })
        }
      })
    },

    deleteEventTrigger (id) {
      api.functions.one(this.currentFunctionId).triggers.delete(id).then(response => {
        this.fetchEventTriggers()
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