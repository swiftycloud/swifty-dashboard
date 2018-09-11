<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content" v-loading="loading">
    <p>User management</p>

    <actions-block>
      <el-button type="primary" size="medium" @click="userCreateDialog = true">Create</el-button>
      <el-button type="primary" size="medium">Plan</el-button>
      <el-button type="primary" size="medium" @click="deleteSelected" :disabled="multipleSelection.length === 0">Delete</el-button>
    </actions-block>

    <div class="row">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="users"
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <div slot="empty">
              <p>You don’t have any users</p>
          </div>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column label width="100px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="loginAs(scope.row)">Login</el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name"
            sortable>
            <template slot-scope="scope">
              {{ scope.row.name }}
              <el-dropdown
                trigger="click"
                placement="bottom-start"
                class="user-object-link-dropdown">
                <el-button type="text" size="medium" class="user-object-link">
                  <i class="fa fa-ellipsis-h"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="user-menu">
                  <el-dropdown-item @click.native="openChangePasswordDialog(scope.row)">Change Password</el-dropdown-item>
                  <el-dropdown-item>Change Plan</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="Status"
            sortable>
          </el-table-column>
          <el-table-column
            prop="plan"
            label="Plan"
            sortable>
          </el-table-column>
          <el-table-column
            prop="uid"
            label="Email"
            sortable>
          </el-table-column>
          <el-table-column
            prop="created"
            label="Created"
            sortable>
            <template slot-scope="scope">
              {{ scope.row.created | moment('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Change user password"
      :visible.sync="changePasswordDialog">
      <el-form label-width="120px" @submit.native.prevent="changePassword">
        <el-form-item label="New password">
          <el-input v-model="passwordForm.password" @keyup.enter="changePassword">
            <el-button slot="append" @click="generatePassword">Generate</el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelChangePasswordDialog">Cancel</el-button>
        <el-button type="primary" @click="changePassword" :loading="passwordUpdating">Update</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Create new user"
      :visible.sync="userCreateDialog">
      <el-form ref="userForm" label-width="120px" @submit.native.prevent="createUser" :model="userForm" :rules="userRules">
        <el-form-item label="Name" prop="name">
          <el-input v-model="userForm.name" placeholder="Name"></el-input>
        </el-form-item>
        <el-form-item label="E-mail" prop="uid">
          <el-input v-model="userForm.uid" placeholder="E-mail"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="userForm.password">
            <el-button slot="append" @click="generatePassword">Generate</el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userCreateDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createUser">Create</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ActionsBlock from '@/components/ActionsBlock'
import api from '@/api'

export default {
  components: { ActionsBlock },

  data () {
    return {
      loading: false,
      users: [],

      userForm: {
        uid: null,
        password: null
      },
      userCreateDialog: false,
      userRules: {
        uid: [
          { required: true, message: 'Please enter your email', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please enter your password', trigger: 'blur' }
        ]
      },

      passwordForm: {
        username: null,
        password: null
      },
      passwordUpdating: false,
      changePasswordDialog: false,

      multipleSelection: []
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Users')
    this.fetchUsers()
  },

  methods: {
    fetchUsers () {
      this.loading = true

      return api.users.get().then(response => {
        this.users = response.data
      }).finally(() => {
        this.loading = false
      })
    },

    loginAs (user) {
      window.open('/?as=' + user.uid, '_blank')
      window.focus()
    },

    generatePassword () {
      let length = 16
      let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''

      for (let i = 0, n = charset.length; i < length; ++i) {
        result += charset.charAt(Math.floor(Math.random() * n))
      }

      this.passwordForm.password = result
      this.userForm.password = result
    },

    openChangePasswordDialog (user) {
      this.generatePassword()
      this.passwordForm.username = user.id
      this.changePasswordDialog = true
    },

    cancelChangePasswordDialog () {
      this.changePasswordDialog = false
      this.passwordForm.password = null
      this.passwordForm.username = null
    },

    changePassword () {
      this.passwordUpdating = true
      api.users.one(this.passwordForm.username).pass(this.passwordForm).finally(() => {
        this.cancelChangePasswordDialog()
        this.passwordUpdating = false
      })
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    deleteSelected () {
      if (this.multipleSelection.length === 0) {
        return false
      }

      this.$confirm('Selected users will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        var promises = []
        this.multipleSelection.forEach(item => {
          promises.push(api.users.delete(item.id))
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchUsers()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data
        })
      }).finally(() => {
        this.loading = false
      })
    },

    createUser () {
      this.$refs['userForm'].validate(valid => {
        if (valid) {
          api.users.create(this.userForm).then(() => {
            this.fetchUsers()
            this.userCreateDialog = false
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data
            })
          })
        }
      })
    }
  }
}
</script>

<style>
.user-object-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.el-button.user-object-link,
.el-button.user-object-link:hover,
.el-button.user-object-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0;
}
</style>
