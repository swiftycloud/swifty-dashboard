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

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="$store.getters.functions"
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
            sortable
            width="160">
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
    this.$store.dispatch('setPageTitle', 'Functions')

    this.$store.dispatch('fetchFunctions').then(() => {
      this.loading = false
    })
  },

  methods: {
    tableRowClassName ({ row, rowIndex }) {
      if (row.state === 'deactivated') {
        return 'deactivated-func'
      }
      return ''
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
        this.multipleSelection.forEach((self) => {
          if (self.state !== 'ready') {
            promises.push(
              this.$store.dispatch('enableFunctionByID', self.id).catch(error => {
                this.$notify.error({
                  title: 'Error',
                  message: error.response.data.message
                })
              })
            )
          }
        })

        return Promise.all(promises)
      }).then(() => {
        return this.$store.dispatch('fetchFunctions', this.$store.getters.currentProject)
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
        this.multipleSelection.forEach((self) => {
          if (self.state !== 'deactivated') {
            promises.push(
              this.$store.dispatch('disableFunctionByID', self.id).catch(error => {
                this.$notify.error({
                  title: 'Error',
                  message: error.response.data.message
                })
              })
            )
          }
        })

        return Promise.all(promises)
      }).then(() => {
        return this.$store.dispatch('fetchFunctions', this.$store.getters.currentProject)
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },
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
          console.log(self)
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
    }
  }
}
</script>

<style lang="scss">
  .deactivated-func td,
  .deactivated-func td a {
    color: #c3c3c3;
  }
</style>
