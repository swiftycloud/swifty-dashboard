<template>
  <div class="page-content">
    <p>Here you can manage your Mongo database</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="createMiddleware">Create Database</el-button>
          <el-button size="medium" plain @click="removeSelected" :disabled="multipleSelection.length === 0">Delete Database</el-button>
        </div>
      </div>
    </div>

    <div class="labels">
      <el-button plain size="mini" @click="label = 'all'">All</el-button>
      <el-button plain size="mini" @click="label = 'none'">No label</el-button>
      <el-button :plain="label != 'auth'" size="mini" @click="label = 'auth'" type="danger">Authentication</el-button>
    </div>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="middlewareList"
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <div slot="empty">
              <p>You don’t have any middlewares</p>
              <el-button type="primary" size="mini" round @click="createMiddleware">Create Database</el-button>
          </div>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Instance name"
            sortable
            width="300">
          </el-table-column>
          <el-table-column
            property="labels">
            <template slot-scope="scope">
              <div style="text-align: right">
                <span v-if="scope.row.labels !== undefined" v-for="v in scope.row.labels" :key="v">
                  <el-tag v-if="v === 'auth'" type="danger">Authentication</el-tag>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            property="type"
            label="Middleware type"
            sortable
            show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { Middleware, MiddlewareList } from '@/models/Middleware'

export default {
  data () {
    return {
      loading: true,
      multipleSelection: [],

      middlewares: new MiddlewareList(),
      label: 'all'
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Mongo Database')

    this.$store.dispatch('fetchMiddlewareList', {
      project: this.$store.getters.project,
      type: 'mongo'
    }).finally(() => {
      this.loading = false
    })

    this.middlewares.set('type', 'mongo')
    this.middlewares.fetch()
  },

  computed: {
    middlewareList () {
      if (this.label === 'all') {
        return this.middlewares.models
      } else if (this.label === 'none') {
        return this.middlewares.filter(item => item.labels === undefined).models
      } else if (this.label === 'auth') {
        return this.middlewares.filter(item => {
          if (item.labels !== undefined && item.labels.length && item.labels.indexOf('auth') !== -1) {
            return true
          } else {
            return false
          }
        }).models
      }
    }
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
        let middleware = new Middleware({
          project: this.$store.getters.currentProject,
          name: input.value,
          type: 'mongo'
        })

        return middleware.save()
      }).then(() => {
        return this.middlewares.fetch()
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
        this.loading = true

        var promises = []
        this.multipleSelection.forEach(middleware => {
          promises.push(
            middleware.delete().catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.middlewares.fetch()
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>
.labels {
  margin-top: 20px;

  .el-button {
    text-transform: none;
  }
}
</style>
