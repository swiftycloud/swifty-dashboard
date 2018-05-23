<template>
  <div class="page-content">
    <p>Here you can manage your authentication services</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="createMiddleware">Create auth database</el-button>
          <el-button size="medium" plain @click="removeSelected" :disabled="multipleSelection.length === 0">Delete database</el-button>
        </div>
      </div>
    </div>

    <div class="row" v-loading="authServices.loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="authServices.models"
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <div slot="empty">
              <p>You don’t have any auth databases</p>
              <el-button type="primary" size="mini" round @click="createMiddleware">Create</el-button>
          </div>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name"
            sortable
            width="300">
            <template slot-scope="scope">
              {{ scope.row.name }}
              <el-dropdown 
                trigger="click" 
                placement="bottom-start"
                class="auth-service-link-dropdown">
                <el-button type="text" size="medium" class="auth-service-link">
                  <i class="fa fa-ellipsis-h"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="auth-service-menu">
                  <el-dropdown-item @click.native="goToAuthFunction(scope.row)">Change Auth Function</el-dropdown-item>
                  <el-dropdown-item @click.native="goToAuthDatabase()">Show Associated Database</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column label="Type"></el-table-column>
          <el-table-column label="Description"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { AuthService, AuthServiceList } from '@/models/AuthService'

export default {
  data () {
    return {
      multipleSelection: [],
      auths: [],

      authServices: new AuthServiceList()
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Authentication Service')
    this.authServices.fetch()
  },

  methods: {
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
    createMiddleware () {
      this.$prompt('Instance name', 'Database creating', {
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        inputPattern: /^[A-z0-9_]+$/,
        inputErrorMessage: 'Invalid instance name'
      }).then(input => {
        this.loading = false

        let authService = new AuthService({
          project: this.$store.getters.project,
          name: input.value,
          type: 'jwt'
        })

        return authService.save()
      }).then(() => {
        return this.authServices.fetch()
      }).then(() => {
        this.$notify.success({
          title: 'Success',
          message: 'Database created'
        })
      }).catch(error => {
        if (error !== 'cancel') {
          this.$notify.error({
            title: 'Error',
            message: error.response.data.message || 'Database creating was failed'
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    removeSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected database will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        var promises = []
        this.multipleSelection.forEach(authService => {
          promises.push(
            authService.delete().catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.authServices.fetch()
      })
    },

    goToAuthFunction (authService) {
      api.deployments.find(authService.id).then(response => {
        let functionName = null
        response.data.items.forEach(item => {
          if (item.type === 'function') {
            functionName = item.name
          }
        })

        return api.functions.get({ name: functionName })
      }).then(response => {
        if (response.data.length) {
          this.$router.push({
            name: 'functions.view.code',
            params: {
              fid: response.data[0].id
            }
          })
        } else {
          this.$notify.error({
            title: 'Error',
            message: 'Auth function not found'
          })
        }
      })
    },

    goToAuthDatabase () {
      this.$router.push({ name: 'mongodb' })
    }
  }
}
</script>

<style lang="scss">
.auth-service-menu {
  min-width: 224px !important;
}

.auth-service-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.auth-service-link, 
.auth-service-link:hover,
.auth-service-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0;
}
</style>
