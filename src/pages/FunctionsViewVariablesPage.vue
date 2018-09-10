<template>
  <div v-loading="loading">
    <p>Environment variables</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="openNewVariableDialog">Create Variable</el-button>
      <el-button type="default" plain size="medium" @click="deleteSelected">Delete</el-button>
    </div>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="variables"
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <div slot="empty">
              <p>You don’t have any variables</p>
              <el-button type="primary" size="mini" round>Create</el-button>
          </div>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="key"
            label="Key"
            width="300px"
            sortable>
            <template slot-scope="scope">
              <span>{{ scope.row.key }}</span>
              <el-dropdown 
                trigger="click" 
                placement="bottom-start"
                class="variable-link-dropdown">
                <el-button type="text" size="medium" class="variable-link">
                  <i class="fa fa-ellipsis-h"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="variable-menu">
                  <el-dropdown-item @click.native="openSettings(scope.row)">Settings</el-dropdown-item>
                  <el-dropdown-item @click.native="deleteVariable(scope.row)">Delete</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column
            property="value"
            label="Value"
            sortable
            show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Variable properties"
      width="35%"
      :visible.sync="newVariableDialogVisible">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="Key">
          <el-input v-model="form.key" placeholder="Key"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="form.value" placeholder="Value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newVariableDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="createVariable">Save</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Variable properties"
      width="35%"
      :visible.sync="openSettingsDialogVisibility">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="Key">
          <el-input v-model="form.key" placeholder="Key" disabled></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="form.value" placeholder="Value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openSettingsDialogVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="saveVariable">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      loading: false,
      variables: [],
      multipleSelection: [],
      form: {
        key: null,
        value: null
      },

      newVariableDialogVisible: false,
      openSettingsDialogVisibility: false
    }
  },

  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'variables')

    this.fetchVariables()
  },

  methods: {
    fetchVariables () {
      this.loading = true
      api.functions.one(this.$route.params.fid).env.get().then(response => {
        this.variables = []
        response.data.forEach(item => {
          let data = item.split('=')
          this.variables.push({ key: data[0], value: data[1] })
        })
      }).finally(() => {
        this.loading = false
      })
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    updateVariables () {
      var vars = []
      this.variables.forEach(item => {
        vars.push(item.key + '=' + item.value)
      })
      return api.functions.one(this.$route.params.fid).env.update(null, vars)
    },

    openNewVariableDialog () {
      this.newVariableDialogVisible = true
      this.form = {
        key: null,
        value: null
      }
    },

    createVariable () {
      this.variables.push(this.form)
      this.updateVariables().then(() => {
        this.newVariableDialogVisible = false
        this.fetchVariables()
      })
    },

    deleteVariable (item) {
      for (let k in this.variables) {
        if (this.variables[k].key === item.key) {
          delete this.variables[k]
        }
      }

      this.updateVariables().then(() => {
        this.fetchVariables()
      })
    },

    deleteSelected () {
      this.multipleSelection.forEach(item => {
        for (let k in this.variables) {
          if (this.variables[k].key === item.key) {
            delete this.variables[k]
            break
          }
        }
      })

      this.updateVariables().then(() => {
        this.fetchVariables()
      })
    },

    openSettings (item) {
      this.form = item
      this.openSettingsDialogVisibility = true
    },

    saveVariable () {
      for (let k in this.variables) {
        if (this.variables[k].key === this.form.key) {
          this.variables[k].value = this.form.value
          break
        }
      }

      this.updateVariables().then(() => {
        this.openSettingsDialogVisibility = false
        this.fetchVariables()
      })
    }
  }
}
</script>

<style>
.variable-menu {
  min-width: 224px !important;
}

.variable-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.variable-link, 
.variable-link:hover,
.variable-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0 !important;
}
</style>