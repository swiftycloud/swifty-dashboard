<template>
  <div class="page-content">
    <p>Here you can manage your Maria database</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="createMiddleware">Create Database</el-button>
          <el-button size="medium" plain @click="removeSelected" :disabled="multipleSelection.length === 0">Delete Database</el-button>
        </div>
      </div>
    </div>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="middlewares"
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
            prop="id"
            label="Instance name"
            sortable
            width="160">
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
export default {
  data () {
    return {
      loading: true,
      multipleSelection: []
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Maria Database')

    this.$store.dispatch('fetchMiddlewareList', this.$store.getters.currentProject).finally(() => {
      this.loading = false
    })
  },

  computed: {
    middlewares () {
      return this.$store.getters.getMiddlewaresByType('maria')
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
        return this.$store.dispatch('addMiddleware', {
          project: this.$store.getters.currentProject,
          id: input.value,
          type: 'maria'
        })
      }).then(() => {
        return this.$store.dispatch('fetchMiddlewareList', this.$store.getters.currentProject)
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
        this.multipleSelection.forEach((self) => {
          promises.push(
            this.$store.dispatch('removeMiddleware', {
              project: this.$store.state.projects.currentProject,
              id: self.id
            }).catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.$store.dispatch('fetchMiddlewareList', this.$store.getters.currentProject)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
