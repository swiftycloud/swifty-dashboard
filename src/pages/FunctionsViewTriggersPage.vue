<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="triggerCreationDialog = true">Add Trigger</el-button>
    </div>

    <hr>

    <el-row>
      <el-col :span="12">
        <p class="trigger-post-url-label">REST API</p>
      </el-col>
      <!--<el-col :span="12">
        <el-button type="primary" plain size="medium">Disable API</el-button>
      </el-col>-->
    </el-row>

    <el-row>
      <el-col :span="24">
        <p class="trigger-post-url">POST https://{{ url }}  <el-button size="mini" type="primary" v-clipboard:copy="'https://' + url" class="fa fa-copy" plain></el-button></p>
      </el-col>
    </el-row>

    <el-table
      ref="multipleTable"
      :data="triggers"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <div slot="empty" class="middleware-empty-message">
          <p>You don’t have any triggers attached to the function</p>
          <el-button type="primary" size="mini" round>Attach</el-button>
      </div>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        label="Name"
        sortable
        width="120">
      </el-table-column>
      <el-table-column
        property="status"
        label="Status"
        sortable
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="type"
        label="Type"
        sortable
        width="120">
      </el-table-column>
    </el-table>

    <el-dialog
      title="Create new scheduled trigger"
      :visible.sync="triggerCreationDialog"
      width="600px">
      <el-form v-model="form">
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
            <el-input v-model="expression" placeholder="23 * * * * *"></el-input>
          </el-form-item>
        </span>
        <el-form-item label="JSON Workload">
          <el-input type="textarea" :rows="5"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="triggerCreationDialog = false">Cancel</el-button>
        <el-button type="primary" @click="triggerCreationDialog = false">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      triggerCreationDialog: false,
      timerSettingValue: 'Visual',
      form: {
        name: null,
        weekdays: [],
        time: null,
        expression: '* * * * * *',
        json: ''
      },
      triggers: [],
      url: null,
      loading: true,
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      times: { start: '00:00', step: '00:15', end: '23:45' }
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'triggers')
    this.$store.dispatch('fetchFunctionInfo', {
      project: this.$store.getters.currentProject,
      name: this.$route.params.name
    }).then(response => {
      this.url = response.data.url
    }).finally(() => {
      this.loading = false
    })
  },
  computed: {
    expression: {
      get: function () {
        let expr = this.form.expression.split(' ')

        let time = this.form.time ? this.form.time.split(':') : ['*', '*']
        let min = parseInt(time[1]) >= 0 ? parseInt(time[1]) : expr[0]
        let hour = parseInt(time[0]) >= 0 ? parseInt(time[0]) : expr[1]
        let weekdays = this.form.weekdays.length ? this.form.weekdays.join(',') : expr[4]

        return [min, hour, expr[2], expr[3], weekdays, expr[5]].join(' ')
      },
      set: function (val) {
        let expr = val.split(' ')

        if (parseInt(expr[0]) >= 0 && parseInt(expr[1]) >= 0) {
          this.form.time = parseInt(expr[1]) + ':' + parseInt(expr[0])
        } else if (parseInt(expr[0]) >= 0) {
          this.form.time = '*:' + parseInt(expr[0])
        } else if (parseInt(expr[1]) >= 0) {
          this.form.time = parseInt(expr[1]) + ':*'
        }

        if (parseInt(expr[4]) >= 0) {
          this.form.weekdays = expr[4].split(',').map(parseInt)
        }

        this.form.expression = val
      }
    }
  },
  methods: {
    handleSelectionChange () {
      // ..
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
</style>
