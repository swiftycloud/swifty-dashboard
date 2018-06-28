<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div v-loading="loading">
    <p>Please add middleware</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="addMiddlewareDialogVisible = true">Attach Middleware</el-button>
      <el-button type="primary" plain size="medium" @click="deattach" :disabled="multipleSelection.length === 0">Deattach</el-button>
    </div>

    <el-table
      ref="multipleTable"
      :data="mwareList"
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
        prop="name"
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
                       :label="mware.name"
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
import api from '@/api'

export default {
  data () {
    return {
      form: {
        type: 's3',
        id: null
      },
      mwareList: [],
      loading: true,
      multipleSelection: [],
      addMiddlewareDialogVisible: false
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'middleware')
    this.fetchMiddlewareList().then(response => {
      return this.$store.dispatch('fetchMiddlewareList', {
        project: this.$store.getters.project
      })
    }).then(response => {
      return this.$store.dispatch('fetchMiddlewareTypes')
    }).then(response => {
      this.$store.dispatch('fetchS3ListBuckets', this.$store.getters.project)
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
    fetchMiddlewareList () {
      this.mwareList = []
      return api.functions.one(this.$route.params.fid).middleware.get().then(response => {
        this.mwareList = response.data != null ? response.data : []
        return api.functions.one(this.$route.params.fid).s3buckets.get()
      }).then(response => {
        response.data.forEach(item => {
          this.mwareList.push({
            id: item,
            name: item,
            type: 's3'
          })
        })
      })
    },

    attach () {
      let type = this.form.type === 's3' ? 's3buckets' : 'middleware'

      api.functions.one(this.$route.params.fid)[type].create('"' + this.form.id + '"').then(response => {
        this.loading = true
        this.addMiddlewareDialogVisible = false
        return this.fetchMiddlewareList()
      }).finally(() => {
        this.loading = false
      })
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

        var promises = []
        this.multipleSelection.forEach((self) => {
          let type = self.type === 's3' ? 's3buckets' : 'middleware'
          promises.push(
            api.functions.one(this.$route.params.fid)[type].delete(self.id).catch(error => {
              this.$notify.error({
                title: 'Error',
                message: error.response.data.message
              })
            })
          )
        })
      }).then(() => {
        return this.fetchMiddlewareList()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
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
