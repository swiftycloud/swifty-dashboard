<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Here you can manage your account and secrets</p>

    <actions-block>
      <el-button type="primary" @click="openNewAccountDialog">Create account</el-button>
    </actions-block>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          :data="accounts"
          ref="multipleTable"
          style="width: 100%">
          <div slot="empty">
              <p>You don’t have any accounts</p>
              <el-button type="primary" size="mini" round>Create account</el-button>
          </div>
          <!--<el-table-column
            type="selection"
            width="55">
          </el-table-column>-->
          <el-table-column
            prop="name"
            label="Name"
            sortable
            width="200">
            <template slot-scope="scope">
              {{ scope.row.name }}
              <el-dropdown
                trigger="click"
                placement="bottom-start"
                class="account-link-dropdown">
                <el-button type="text" size="medium" class="account-link">
                  <i class="fa fa-ellipsis-h"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="account-menu">
                  <el-dropdown-item @click.native="openUpdateAccountDialog(scope.row)">Settings</el-dropdown-item>
                  <el-dropdown-item @click.native="deleteAccount(scope.row.id)">Delete</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="Type"
            sortable>
          </el-table-column>
          <el-table-column
            prop="update"
            label="Updated"
            sortable
            width="200">
          </el-table-column>
        </el-table>

        <el-dialog
          title="Account properties"
          :visible.sync="newAccountDialog">
          <el-form label-width="170px">
            <el-form-item label="Account Type">
              <el-select v-model="accountForm.type">
                <el-option label="Generic" value="generic"></el-option>
                <el-option label="Telegram API" value="telegram"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Account Name">
              <el-input v-model="accountForm.name" placeholder="Swifty_Bot"></el-input>
            </el-form-item>
            <el-form-item label="Token">
              <el-input v-model="accountForm.token" placeholder="dsdzijicdhcc7etcetceub3idh83gc7egc6tuybc837ec"></el-input>
            </el-form-item>
          </el-form>
          <p>You can attach account to the function to store secret access data.</p>
          <span slot="footer" class="dialog-footer text-left">
            <el-button @click="cancelNewAccountDialog">Cancel</el-button>
            <el-button type="primary" @click="createAccount">Save</el-button>
          </span>
        </el-dialog>

        <el-dialog
          title="Account properties"
          :visible.sync="updateAccountDialog">
          <el-form label-width="170px">
            <el-form-item label="Account Type">
              <el-select v-model="accountForm.type">
                <el-option label="Generic" value="generic"></el-option>
                <el-option label="Telegram API" value="telegram"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Account Name">
              <el-input v-model="accountForm.name" placeholder="Swifty_Bot"></el-input>
            </el-form-item>
            <el-form-item label="Token">
              <el-input v-model="accountForm.token" placeholder="dsdzijicdhcc7etcetceub3idh83gc7egc6tuybc837ec"></el-input>
            </el-form-item>
          </el-form>
          <p>You can attach account to the function to store secret access data.</p>
          <span slot="footer" class="dialog-footer text-left">
            <el-button @click="cancelUpdateAccountDialog">Cancel</el-button>
            <el-button type="primary" @click="updateAccount">Save</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
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
      accountForm: {
        id: null,
        type: 'generic',
        name: null,
        token: null
      },
      accounts: [],

      newAccountDialog: false,
      updateAccountDialog: false
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Accounts')
    this.fetchAccounts()
  },

  methods: {
    fetchAccounts () {
      this.loading = true
      api.accounts.get().then(response => {
        this.accounts = response.data
      }).finally(response => {
        this.loading = false
      })
    },

    openNewAccountDialog () {
      this.accountForm.id = null
      this.accountForm.type = 'generic'
      this.accountForm.name = null
      this.accountForm.token = null
      this.newAccountDialog = true
    },

    cancelNewAccountDialog () {
      this.newAccountDialog = false
    },

    openUpdateAccountDialog (account) {
      this.accountForm = {...account}
      this.updateAccountDialog = true
    },

    cancelUpdateAccountDialog () {
      this.updateAccountDialog = false
    },

    createAccount () {
      api.accounts.create(this.accountForm).then(() => {
        this.cancelNewAccountDialog()
        this.fetchAccounts()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      })
    },

    updateAccount () {
      let form = {
        type: this.accountForm.type,
        name: this.accountForm.name
      }

      if (this.accountForm.token.length > 9) {
        form.token = this.accountForm.token
      }

      api.accounts.update(this.accountForm.id, form).then(() => {
        this.cancelUpdateAccountDialog()
        this.fetchAccounts()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      })
    },

    deleteAccount (accountId) {
      this.$confirm('Selected account will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        api.accounts.delete(accountId).finally(() => {
          this.fetchAccounts()
        })
      })
    }
  }
}
</script>

<style>
.account-menu {
  min-width: 224px !important;
}

.account-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.el-button.account-link,
.el-button.account-link:hover,
.el-button.account-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0 !important;
}
</style>