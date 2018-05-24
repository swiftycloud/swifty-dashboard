<template>
  <div class="page-content">
    <p>Here you can manage your functions</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="$router.push({ name: 'functions.create' })">New function</el-button>
          <el-button
          type="primary"
           size="medium"
           plain
           @click="manageAuthDialogVisibility = true"
           :disabled="this.multipleSelection.length === 0">
          Manage authentication
          </el-button>
          <el-button
          type="primary"
           size="medium"
           plain
           @click="enableSelected()"
           :disabled="this.multipleSelection.length === 0">
          Enable
          </el-button>
          <el-button
           size="medium"
           plain
           @click="disableSelected()"
           :disabled="this.multipleSelection.length === 0">
            Disable
          </el-button>
          <el-button
            size="medium"
            plain
            @click="deleteSelected()"
            :disabled="this.multipleSelection.length === 0">
            Delete
          </el-button>
        </div>
      </div>
    </div>

    <div class="row" v-loading="functions.loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="functions.models"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :row-class-name="tableRowClassName">
          <div slot="empty">
              <p>You don’t have any functions</p>
              <el-button type="primary" size="mini" round @click="$router.push({ name: 'functions.create' })">Create</el-button>
          </div>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name"
            sortable>
            <template slot-scope="scope">
              <router-link :to="{ name: 'functions.view.code', params: { fid: scope.row.id } }" v-if="scope.row.state != 'deactivated'">
                {{ scope.row.name }}
              </router-link>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="state"
            label="Status"
            sortable
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            label="Authentication"
            sortable
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="'authctx' in scope.row"><i class="fa fa-lock" aria-hidden="true"></i></span>
              <span v-else><i class="fa fa-unlock-alt" aria-hidden="true"></i></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastcall"
            label="Last Run"
            sortable>
            <template slot-scope="scope">
              <el-tooltip
                v-if="scope.row.lastcall"
                effect="dark"
                :content="scope.row.lastcall | moment('YYYY-MM-DD HH:mm:ss')"
                placement="right">
                <span v-if="'lastcall' in scope.row">{{ scope.row.lastcall | moment('from', 'now') }}</span>
              </el-tooltip>
              <span v-if="scope.row.lastcall === undefined">never</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Manage Authentication For Your Functions"
      :visible.sync="manageAuthDialogVisibility"
      width="600px">
      <el-form ref="authForm" :model="authForm" label-width="200px" :rules="authFormRules">
        <el-form-item label="Authentication Service" prop="service">
          <el-select v-model="authForm.service" placeholder="Authentication Service">
            <el-option v-for="service in authServices.models" :value="service.id" :label="service.name" :key="service.id"></el-option>
          </el-select>
          <el-popover
            ref="authinfo"
            placement="right"
            title="Authentication Database"
            width="350"
            trigger="hover"
            content="If you do not have any Authentication Databases, please create one using Authentication Service.">
          </el-popover>
          <a href="#" @click.prevent class="input-info" v-popover:authinfo>
            <span class="fa-stack fa-sm">
              <i class="fa fa-circle-thin fa-stack-2x"></i>
              <i class="fa fa-info fa-stack-1x"></i>
            </span>
          </a>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="manageAuthDialogVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="enableAuthentication">Enable</el-button>
        <el-button type="danger" @click="disableAuthentication">Disable</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'

import { FunctionList } from '@/models/Function'
import { AuthServiceList } from '@/models/AuthService'

export default {
  data () {
    return {
      // objects
      functions: new FunctionList(),
      authServices: new AuthServiceList(),

      // manage
      multipleSelection: [],
      manageAuthDialogVisibility: false,

      // forms
      authForm: {
        service: ''
      },

      // rules
      authFormRules: {
        service: [
          { required: true, message: 'Please select Authentication Service', trigger: 'change' }
        ]
      }
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Functions')

    this.functions.fetch()
    this.authServices.fetch()
  },

  methods: {
    tableRowClassName ({ row, rowIndex }) {
      if (row.state === 'deactivated') {
        return 'deactivated-func'
      }
      return ''
    },

    // table selection
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    /*
     * Enable & Disable functions
     */
    enableSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }
      this.$confirm('Selected function will be enabled', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach(item => {
          promises.push(item.activate())
        })

        return Promise.all(promises)
      }).then(() => {
        return this.functions.fetch()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    disableSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected function will be disabled', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach(item => {
          promises.push(item.deactivate())
        })

        return Promise.all(promises)
      }).then(() => {
        return this.functions.fetch()
      }).catch(error => {
        console.log(error)
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    /*
     * Delete functions
     */
    deleteSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected functions will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach((self) => {
          promises.push(
            this.$store.dispatch('deleteFunctionByID', self.id).catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.$store.dispatch('fetchFunctions', this.$store.getters.currentProject)
      }).catch(() => {
        // ..
      }).finally(() => {
        this.loading = false
      })
    },

    /*
     * Enable & Disable authentication
     */
    enableAuthentication () {
      if (this.multipleSelection.length === 0) {
        this.$notify.error({
          title: 'Error',
          message: 'No function selected'
        })

        return false
      }

      this.$refs['authForm'].validate((valid) => {
        if (valid) {
          this.$confirm('Authentication will be enabled for selected functions', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.loading = true
            return api.deployments.find(this.authForm.service)
          }).then(response => {
            var mwareName = null
            response.data.items.forEach(item => {
              if (item.type === 'mware' && /^.+_jwt$/.test(item.name)) {
                mwareName = item.name
              }
            })

            var promises = []
            this.multipleSelection.forEach(item => {
              if ('labels' in item && item.labels.indexOf('auth') !== -1) {
                return false
              }

              promises.push(
                item.updateAuthCtx(mwareName)
              )
            })

            return Promise.all(promises)
          }).then(() => {
            this.manageAuthDialogVisibility = false
            return this.functions.fetch()
          }).catch(() => {
            // ..
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    disableAuthentication () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Authentication will be disabled for selected functions', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach(item => {
          if ('labels' in item && item.labels.indexOf('auth') !== -1) {
            return false
          }

          promises.push(
            item.updateAuthCtx('')
          )
        })

        return Promise.all(promises)
      }).then(() => {
        this.manageAuthDialogVisibility = false
        return this.functions.fetch()
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
.deactivated-func td,
.deactivated-func td a {
  color: #c3c3c3;
}

.input-info {
  margin-left: 10px;
  color: rgba(0, 0, 0, 0.54);

  .fa-stack {
    height: 30px;
  }
}
</style>
