<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Here you can manage your remote repositories</p>

    <actions-block>
      <repos-attach-new @close="fetchRepositories"></repos-attach-new>
    </actions-block>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          :data="repositories"
          ref="multipleTable"
          style="width: 100%">
          <div slot="empty">
              <p>You don’t have any repositories</p>
              <el-button type="primary" size="mini" round>Attach</el-button>
          </div>
          <!--<el-table-column
            type="selection"
            width="55">
          </el-table-column>-->
          <el-table-column
            prop="url"
            label="Name"
            sortable>
            <template slot-scope="scope">
              {{ scope.row.url }}
              <el-dropdown
                trigger="click"
                placement="bottom-start"
                class="repo-link-dropdown">
                <el-button type="text" size="medium" class="repo-link">
                  <i class="fa fa-ellipsis-h"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="repo-menu">
                  <el-dropdown-item @click.native="openSettingsFormModal(scope.row)" v-if="scope.row.account_id === undefined">Settings</el-dropdown-item>
                  <el-dropdown-item @click.native="disconnectRepo(scope.row)">Disconnect</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="Type"
            sortable
            width="200">
            <template slot-scope="scope">
              <span v-if="scope.row.account_id === undefined">Git URL</span>
              <span v-else>GitHub</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="state"
            label="Status"
            sortable
            width="200">
          </el-table-column>
        </el-table>

        <el-dialog
          title="Repository Settings"
          :visible.sync="settingsRepoFormDialog">
            <el-form label-width="170px">
              <el-form-item label="Git Repository URL" style="margin-bottom: 0">
                <el-input v-model="form.url" placeholder="https://username:password@github.com/user/repo.git"></el-input>
              </el-form-item>
              <el-form-item>
                <el-checkbox label="Mirror repository automatically" v-model="form.mirror"></el-checkbox>
                <el-popover
                  ref="mirror"
                  placement="right"
                  title="Repository Mirroring"
                  width="400"
                  trigger="hover">
                  Automatically update this project's branches and tags from the upstream repository every hour.<br>

                  <span class="fa-stack mirror-info" slot="reference">
                    <i class="fa fa-circle-thin fa-stack-2x"></i>
                    <i class="fa fa-info fa-stack-1x"></i>
                  </span>
                </el-popover>
              </el-form-item>
            </el-form>
            <p>
              The repository must be accessible over http://, https:// or git://.<br>
              If your HTTP repository is not publicly accessible, add authentication information to the URL like:
              https://username:password@github.com/user/repo.git.<br>
            </p>
            <span slot="footer" class="dialog-footer text-left">
              <el-button @click="cancelSettingsFormModal">Cancel</el-button>
              <el-button type="primary" @click="updateRepository">Done</el-button>
            </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import ActionsBlock from '@/components/ActionsBlock'
import ReposAttachNew from '@/components/ReposAttachNew'

import Repository from '@/models/Repository'
import RepoAccount from '@/models/RepoAccount'

export default {
  components: { ActionsBlock, ReposAttachNew },
  data () {
    return {
      loading: true,

      repositories: [],
      accounts: [],

      form: {
        repo: null,
        url: '',
        mirror: true
      },

      label: 'all',

      settingsRepoFormDialog: false
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Repositories')

    this.fetchRepositories()
  },

  methods: {
    fetchRepositories () {
      this.loading = true
      return Repository.params({
        attached: true
      }).get().then(repositories => {
        this.repositories = repositories
      }).finally(() => {
        this.loading = false
      })
    },

    fetchAccounts () {
      this.loading = true
      return RepoAccount.get().then(accounts => {
        this.accounts = accounts
      }).finally(() => {
        this.loading = false
      })
    },

    resetFormData () {
      this.form.id = null
      this.form.type = 'github'
      this.form.token = ''
      this.form.user = ''
      this.form.url = ''
      this.form.mirror = true
    },

    disconnectRepo (repo) {
      this.$confirm('Repo will be disconnected', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        return repo.delete()
      }).finally(() => {
        this.fetchRepositories()
      })
    },

    openSettingsFormModal (repo) {
      this.form.repo = repo
      this.form.url = repo.url
      this.settingsRepoFormDialog = true
    },

    cancelSettingsFormModal () {
      this.settingsRepoFormDialog = false
    },

    updateRepository () {
      this.form.repo.url = this.form.url
      this.form.repo.pulling = this.form.mirror ? 'periodic' : null
      this.form.repo.save().then(() => {
        this.cancelSettingsFormModal()
        this.fetchRepositories()
      })
    }
  }
}
</script>

<style lang="scss">
.mirror-info {
  font-size: 12px;
  margin-left: 15px;
}

.repo-menu {
  min-width: 224px !important;
}

.repo-link-dropdown {
  float: right;
  width: 32px;
  text-align: center;
}

.el-button.repo-link,
.el-button.repo-link:hover,
.el-button.repo-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0 !important;
}

.labels {
  margin-top: 20px;

  .el-button {
    text-transform: none;
  }
}
</style>
