<template>
  <div v-loading="loading">
    <p>Please add middleware</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="addMiddlewareDialogVisible = true">Attach Middleware</el-button>
      <el-button type="primary" plain size="medium" @click="deattach" :disabled="multipleSelection.length === 0">Deattach</el-button>
    </div>

    <el-table
      ref="multipleTable"
      :data="$store.getters.getFunctionMwaresAndBuckets"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <div slot="empty" class="middleware-empty-message">
          <p>You don’t have any middleware configured to attach it to the function</p>
          <el-button type="primary" size="mini" round @click="$router.push({ name: 'storage' })">Create Object Storage</el-button>
          <el-button type="primary" size="mini" round @click="$router.push({ name: 'mariadb' })">Create Maria Database</el-button>
          <el-button type="primary" size="mini" round @click="$router.push({ name: 'mongodb' })">Create Mongo Database</el-button>
      </div>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="id"
        label="Name"
        sortable>
      </el-table-column>
      <el-table-column
        prop="type"
        label="Type"
        sortable>
      </el-table-column>
    </el-table>

    <el-dialog
      title="Attach new middleware"
      width="35%"
      :visible.sync="addMiddlewareDialogVisible">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="Middleware type">
          <el-select v-model="form.type" placeholder="Middleware type" style="width: 100%">
            <el-option v-for="type in $store.getters.getMiddlewareTypes"
                       :label="type.name"
                       :value="type.id"
                       :key="type.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Instance name">
          <el-select v-model="form.id" placeholder="Instance name" style="width: 100%">
            <el-option v-for="mware in middlewares"
                       :label="mware.id"
                       :value="mware.id"
                       :key="mware.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addMiddlewareDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="attach">Attach</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        type: 's3',
        id: null
      },
      loading: true,
      multipleSelection: [],
      addMiddlewareDialogVisible: false
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'middleware')
    this.$store.dispatch('fetchFunctionInfo', {
      project: this.$store.getters.currentProject,
      name: this.$route.params.name
    }).then(response => {
      this.loading = false
      return this.$store.dispatch('fetchMiddlewareList', this.$store.getters.currentProject)
    }).then(response => {
      return this.$store.dispatch('fetchMiddlewareTypes')
    }).then(response => {
      this.$store.dispatch('fetchS3ListBuckets', this.$store.getters.currentProject)
    }).catch(() => {
      // ..
    }).finally(() => {
      this.loading = false
    })
  },
  watch: {
    'form.type': function () {
      this.form.id = null
    }
  },
  computed: {
    middlewares () {
      if (this.form.type === 's3') {
        var buckets = []
        this.$store.getters.getS3Buckets.forEach((v, k) => {
          buckets.push({
            id: v.Name
          })
        })

        return buckets
      } else {
        return this.$store.getters.getMiddlewaresByType(this.form.type)
      }
    }
  },
  methods: {
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    attach () {
      if (this.form.id != null) {
        var data = {
          project: this.$store.getters.currentProject,
          name: this.$route.params.name
        }

        if (this.form.type === 's3') {
          var buckets = [...this.$store.getters.getFunctionBuckets]
          if (buckets.indexOf(this.form.id) === -1) {
            buckets.push(this.form.id)
          } else {
            return this.$notify.error({
              title: 'Error',
              message: 'This bucket already attached'
            })
          }
          data.s3buckets = buckets
        } else {
          var mwares = [...this.$store.getters.getFunctionMwares]
          if (mwares.indexOf(this.form.id) === -1) {
            mwares.push(this.form.id)
          } else {
            return this.$notify.error({
              title: 'Error',
              message: 'This middleware already attached'
            })
          }
          data.mware = mwares
        }

        this.$store.dispatch('updateFunction', data).then(response => {
          // this.addMiddlewareDialogVisible = false
          this.loading = true
          return this.$store.dispatch('fetchFunctionInfo', {
            project: this.$store.getters.currentProject,
            name: this.$route.params.name
          })
        })

        this.$store.dispatch('updateTestFunction', data).then(response => {
          this.addMiddlewareDialogVisible = false
          // this.loading = true
          return this.$store.dispatch('fetchTestFunctionInfo', {
            project: this.$store.getters.currentProject,
            name: this.$route.params.name
          })
        }).finally(() => {
          this.loading = false
        })
      }
    },

    deattach () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected middlewares will be deattached', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var middlewareList = [...this.$store.getters.getFunctionMwares]
        this.multipleSelection.forEach((self) => {
          if (self.type !== 's3') {
            var index = middlewareList.indexOf(self.id)
            if (index > -1) {
              middlewareList.splice(index, 1)
            }
          }
        })

        var bucketList = [...this.$store.getters.getFunctionBuckets]
        this.multipleSelection.forEach((self) => {
          if (self.type === 's3') {
            var index = bucketList.indexOf(self.id)
            if (index > -1) {
              bucketList.splice(index, 1)
            }
          }
        })

        return this.$store.dispatch('updateFunction', {
          project: this.$store.getters.currentProject,
          name: this.$route.params.name,
          mware: middlewareList,
          s3buckets: bucketList
        })
      }).then(() => {
        return this.$store.dispatch('fetchFunctionInfo', {
          project: this.$store.getters.currentProject,
          name: this.$route.params.name
        })
      }).catch(() => {
        // ..
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.middleware-empty-message {
  .el-button {
    text-transform: none !important;
    margin-bottom: 5px;
  }
}
</style>
