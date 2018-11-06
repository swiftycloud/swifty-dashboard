<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-dropdown trigger="click" placement="bottom-start">
        <el-button type="primary" size="medium">Add Trigger <i class="fa fa-angle-down"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="createUrlEventTrigger" :disabled="disabledUrlTriggerButton">REST API (URL)</el-dropdown-item>
          <el-dropdown-item @click.native="openCronCreationDialog">Scheduled Action</el-dropdown-item>
          <el-dropdown-item @click.native="openS3CreationDialog">Object Storage</el-dropdown-item>
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
            class="trigger-link-dropdown">
            <el-button type="text" size="medium" class="trigger-link">
              <i class="fa fa-ellipsis-h"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="trigger-menu">
              <el-dropdown-item v-if="scope.row.source === 'cron'" @click.native="openCronEditingDialog(scope.row.id)">Edit Trigger</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.source === 's3'" @click.native="openS3EditingDialog(scope.row.id)">Edit Trigger</el-dropdown-item>
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
          <span v-if="scope.row.source === 'url'">
            <span style="padding-right: 10px" class="trigger-post-url">{{ scope.row.url }}</span>
          </span>
          <span v-if="scope.row.source === 's3'">{{ scope.row.s3.ops.split(',').join(', ') }}</span>
          <span v-else>{{ scope.row.data }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px">
        <template slot-scope="scope">
          <span v-if="scope.row.source === 'url'">
            <el-button size="mini" type="primary" plain @click="copyToClipboard()">{{ copyButtonText }}</el-button>
            <input type="text" class="copy-text-input" id="copyText" :value="scope.row.url">
          </span>
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
        <el-button type="primary" @click="createCronEventTrigger" v-loading="formLoading">Create</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Edit scheduled trigger"
      :visible.sync="dialogCronEditingVisibility"
      width="600px">
      <el-form ref="cronEditingForm" :model="forms.cron" :rules="formRules.cron" @submit="updateCronEventTrigger">
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
        <el-button @click="dialogCronEditingVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="updateCronEventTrigger" v-loading="formLoading">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create new object storage trigger"
      :visible.sync="dialogS3CreationVisibility"
      width="600px">
      <el-form ref="s3CreationForm" :model="forms.s3" @submit="createS3EventTrigger" :rules="formRules.s3">
        <el-form-item label="Bucket" label-width="120px" prop="bucket">
          <el-select v-model="forms.s3.bucket" placeholder="Select bucket" style="width: 450px">
            <el-option v-for="(bucket, k) in $store.getters.getS3Buckets" :key="k" :value="bucket.Name" :label="bucket.Name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Event type" label-width="120px" prop="events">
          <el-select multiple v-model="forms.s3.events" placeholder="Select event type" style="width: 450px">
            <el-option value="put" label="Object Created - PUT"></el-option>
            <el-option value="delete" label="Object Deleted - DELETE"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Path to object" label-width="120px">
          <el-input v-model="forms.s3.path" placeholder="folder1/"></el-input>
        </el-form-item>

        <el-form-item label="Filter" label-width="120px">
          <el-input v-model="forms.s3.filter" placeholder="*.img"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogS3CreationVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="createS3EventTrigger" v-loading="formLoading">Create</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Edit object storage trigger"
      :visible.sync="dialogS3EditingVisibility"
      width="600px">
      <el-form ref="s3EditingForm" :model="forms.s3" @submit="updateS3EventTrigger" :rules="formRules.s3">
        <el-form-item label="Bucket" label-width="120px" prop="bucket">
          <el-select v-model="forms.s3.bucket" placeholder="Select bucket" style="width: 450px">
            <el-option v-for="(bucket, k) in $store.getters.getS3Buckets" :key="k" :value="bucket.Name" :label="bucket.Name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Event type" label-width="120px" prop="events">
          <el-select multiple v-model="forms.s3.events" placeholder="Select event type" style="width: 450px">
            <el-option value="put" label="Object Created - PUT"></el-option>
            <el-option value="delete" label="Object Deleted - DELETE"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Path to object" label-width="120px">
          <el-input v-model="forms.s3.path" placeholder="folder1/"></el-input>
        </el-form-item>

        <el-form-item label="Filter" label-width="120px">
          <el-input v-model="forms.s3.filter" placeholder="*.img"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogS3EditingVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="updateS3EventTrigger" v-loading="formLoading">Save</el-button>
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
      formLoading: false,
      dialogCronCreationVisibility: false,
      dialogCronEditingVisibility: false,
      dialogS3CreationVisibility: false,
      dialogS3EditingVisibility: false,
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
          id: null,
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
        },
        s3: {
          bucket: [
            { required: true, message: 'Please select the bucket', trigger: 'blur' }
          ],
          events: [
            { required: true, message: 'Please select event type', trigger: 'blur' }
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
      },

      copyButtonText: 'Copy'
    }
  },

  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'triggers')
    this.$store.dispatch('fetchS3ListBuckets', {
      project: this.$store.getters.currentProject
    })

    this.fetchEventTriggers()
  },

  computed: {
    disabledUrlTriggerButton: function () {
      for (var k in this.triggers) {
        if (this.triggers[k].source === 'url') {
          return true
        }
      }

      return false
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

    fetchEventTriggers () {
      this.loading = true
      this.$store.dispatch('fetchFunctionByID', this.$route.params.fid).then(response => {
        this.currentFunctionId = response.data.id
        return api.functions.one(this.currentFunctionId).triggers.get()
      }).then(response => {
        this.triggers = response.data
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
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
          id: null,
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

    openCronEditingDialog (id) {
      this.resetForms()
      this.forms.cron.id = id

      api.functions.one(this.currentFunctionId).triggers.find(id).then(response => {
        this.forms.cron.formType = 'Cron'
        this.forms.cron.name = response.data.name
        this.forms.cron.expression = response.data.cron.tab
        this.forms.cron.json = JSON.stringify(response.data.cron.args)

        this.updateFormByExpr(this.forms.cron.expression)

        this.dialogCronEditingVisibility = true
      }).catch(() => {
        this.$notify.error({
          title: 'Error',
          message: 'Something wrong'
        })
      })
    },

    openS3CreationDialog () {
      this.resetForms()
      this.dialogS3CreationVisibility = true
    },

    openS3EditingDialog (id) {
      this.resetForms()
      this.forms.s3.id = id

      api.functions.one(this.currentFunctionId).triggers.find(id).then(response => {
        this.forms.s3.bucket = response.data.s3.bucket
        this.forms.s3.events = response.data.s3.ops.split(',')
        this.forms.s3.path = response.data.s3.path
        this.forms.s3.filter = response.data.s3.pattern

        this.dialogS3EditingVisibility = true
      }).catch(() => {
        this.$notify.error({
          title: 'Error', message: 'Something wrong'
        })
      })
    },

    createUrlEventTrigger () {
      api.functions.one(this.currentFunctionId).triggers.create({
        name: 'REST API',
        source: 'url'
      }).then(response => {
        this.fetchEventTriggers()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    },

    createCronEventTrigger () {
      this.$refs.cronCreationForm.validate(valid => {
        if (valid) {
          this.formLoading = true

          if (this.forms.cron.formType === 'Visual') {
            this.updateExpression()
          }

          var args = {}
          try {
            args = JSON.parse(this.forms.cron.json)
          } catch (e) {}

          api.functions.one(this.currentFunctionId).triggers.create({
            name: this.forms.cron.name,
            cron: {
              tab: this.forms.cron.expression,
              args: args
            }
          }).then(response => {
            this.dialogCronCreationVisibility = false
            return this.fetchEventTriggers()
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Unknown error'
            })
          }).finally(() => {
            this.formLoading = false
          })
        }
      })
    },

    updateCronEventTrigger () {
      this.$refs.cronEditingForm.validate(valid => {
        if (valid) {
          this.formLoading = true

          if (this.forms.cron.formType === 'Visual') {
            this.updateExpression()
          }

          var args = {}
          try {
            args = JSON.parse(this.forms.cron.json)
          } catch (e) {}

          api.functions.one(this.currentFunctionId).triggers.create({
            name: this.forms.cron.name,
            cron: {
              tab: this.forms.cron.expression,
              args: args
            }
          }).then(response => {
            return api.functions.one(this.currentFunctionId).triggers.delete(this.forms.cron.id)
          }).then(response => {
            this.dialogCronEditingVisibility = false
            return this.fetchEventTriggers()
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Unknown error'
            })
          }).finally(() => {
            this.formLoading = false
          })
        }
      })
    },

    createS3EventTrigger () {
      this.$refs.s3CreationForm.validate(valid => {
        if (valid) {
          this.formLoading = true
          api.functions.one(this.currentFunctionId).triggers.create({
            name: this.forms.s3.bucket,
            s3: {
              bucket: this.forms.s3.bucket,
              ops: this.forms.s3.events.join(','),
              pattern: this.forms.s3.filter
            }
          }).then(response => {
            this.dialogS3CreationVisibility = false
            return this.fetchEventTriggers()
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Unknown error'
            })
          }).finally(() => {
            this.formLoading = false
          })
        }
      })
    },

    updateS3EventTrigger () {
      this.$refs.s3EditingForm.validate(valid => {
        if (valid) {
          this.formLoading = true
          api.functions.one(this.currentFunctionId).triggers.create({
            name: this.forms.s3.bucket,
            s3: {
              bucket: this.forms.s3.bucket,
              ops: this.forms.s3.events.join(','),
              pattern: this.forms.s3.filter
            }
          }).then(response => {
            return api.functions.one(this.currentFunctionId).triggers.delete(this.forms.s3.id)
          }).then(response => {
            this.dialogS3EditingVisibility = false
            return this.fetchEventTriggers()
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Unknown error'
            })
          }).finally(() => {
            this.formLoading = false
          })
        }
      })
    },

    deleteEventTrigger (id) {
      api.functions.one(this.currentFunctionId).triggers.delete(id).then(response => {
        this.fetchEventTriggers()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message || 'Unknown error'
        })
      })
    }
  }
}
</script>

<style lang="scss">
.trigger-post-url {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  float: left;
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
  padding: 0 !important;
}

.copy-text-input {
  opacity: 0;
  width: 1px;
  height: 1px;
}
</style>