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

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="auths"
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
            sortable>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      loading: false,
      multipleSelection: [],
      auths: []
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Authentication Service')
    this.fetchAuthService()
  },

  computed: {
    middlewares () {
      return this.$store.getters.getMiddlewaresByType('authjwt')
    }
  },

  methods: {
    fetchAuthService () {
      this.loading = true
      return api.auths.get({
        project: this.$store.getters.project
      }).then(response => {
        this.auths = response.data !== null ? response.data : []
      }).finally(() => {
        this.loading = false
      })
    },
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
        return api.auths.create({
          project: this.$store.getters.project,
          name: input.value,
          type: 'jwt'
        })
      }).then(() => {
        return this.fetchAuthService()
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
            api.auths.delete(self.id).catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchAuthService()
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
