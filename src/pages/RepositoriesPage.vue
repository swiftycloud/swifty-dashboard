<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Here you can manage your remote repositories</p>

    <actions-block>
      <el-button type="primary" size="medium" @click="showAttachRepoDialog">Attach Repo</el-button>
    </actions-block>

    <div class="labels">
      <el-button plain size="mini" @click="label = 'all'">All</el-button>
      <el-button plain size="mini" @click="label = 'connected'">Connected</el-button>
      <el-button :plain="label != 'not connected'" size="mini" @click="label = 'not connected'" type="primary">Not connected</el-button>
    </div>

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
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
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
                  <el-dropdown-item @click.native="openSettingsFormModal(scope.row)">Settings</el-dropdown-item>
                  <el-dropdown-item @click.native="disconnectRepo(scope.row)">Disconnect</el-dropdown-item>
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
            prop="state"
            label="Status"
            sortable>
            <template slot-scope="scope">
              <el-button type="default" size="mini">{{ scope.row.state }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Add new repository"
      :visible.sync="attachRepoDialogVisibility">
      <el-form label-width="170px">
        <el-form-item label="Repository Type">
          <el-select v-model="form.type">
            <el-option label="GitHub" value="github"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Personal Access Token" v-if="form.type === 'github'" style="margin-bottom: 0;">
          <el-input v-model="form.token" placeholder="xhgchxcgyycxtcve536dfvdtf5vhsc63vv36v"></el-input>
        </el-form-item>
        <el-form-item label style="margin-bottom: 0;">
          or
        </el-form-item>
        <el-form-item label="GitHub account name" v-if="form.type === 'github'">
          <el-input v-model="form.user" placeholder="swifty"></el-input>
        </el-form-item>
      </el-form>
      <p v-if="form.type === 'github'">
        To integrate with GitHub you need to generate a <a href="#" class="primary">Personal Access Token</a>. When you create your Personal Access Token, you will need to select the repo scope, so we can display a list of your public and private repositories which are available to connect.
      </p>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="cancelAddAccountDialog">Cancel</el-button>
        <el-button type="primary" v-if="form.type === 'github'" :disabled="!form.token && !form.user" @click="addAccount">Next</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Select Repository"
      :visible.sync="selectRepoDialogVisibility">
      <p>Repository Name</p>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="cancelSelectRepoDialog">Cancel</el-button>
        <el-button type="primary" @click="cancelSelectRepoDialog">Done</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Add Remote Repository Using URL"
      :visible.sync="addRepoByURLDialogVisibility">
      <el-form label-width="170px">
        <el-form-item label="Git Repository URL" style="margin-bottom: 0">
          <el-input v-model="form.url" placeholder="https://username:password@gitlab.company.com/group/project.git"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox label="Mirror repository automatically" v-model="form.mirror"></el-checkbox>
          <el-popover
            ref="mirror"
            placement="right"
            title="Repository Mirroring"
            width="400"
            trigger="hover">
            Automatically update this project's branches and tags from the upstream repository every hour. The Git LFS objects will not be synced.<br><a href='#' class="primary">More details</a>

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
        https://username:password@gitlab.company.com/group/project.git.<br>
        The import will time out after 180 minutes 0 seconds. For repositories that take longer, use a clone/push combination.
      </p>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="cancelAddRepoByURLDialog">Cancel</el-button>
        <el-button type="primary" :disabled="!form.url" @click="addRepoByURL">Add</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ActionsBlock from '@/components/ActionsBlock'

import Repository from '@/models/Repository'
import RepoAccount from '@/models/RepoAccount'

export default {
  components: { ActionsBlock },
  data () {
    return {
      loading: true,

      repositories: [],
      accounts: [],

      form: {
        id: null,
        type: 'github',
        token: '',
        user: '',
        url: '',
        mirror: true
      },

      label: 'all',

      selectRepoDialogVisibility: false,
      attachRepoDialogVisibility: false,
      addRepoByURLDialogVisibility: false,
      settingsRepoFormDialog: false
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Repositories')

    this.fetchRepositories()
    this.fetchAccounts()
  },

  methods: {
    fetchRepositories () {
      this.loading = true
      return Repository.get().then(repositories => {
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

    showAttachRepoDialog () {
      this.resetFormData()
      this.attachRepoDialogVisibility = true
    },

    showAddRepoByURLDialog () {
      this.resetFormData()
      this.addRepoByURLDialogVisibility = true
    },

    showSelectRepoDialog () {
      this.selectRepoDialogVisibility = true
    },

    cancelAddAccountDialog () {
      this.attachRepoDialogVisibility = false
    },

    cancelAddRepoByURLDialog () {
      this.addRepoByURLDialogVisibility = false
    },

    cancelSelectRepoDialog () {
      this.selectRepoDialogVisibility = false
    },

    addAccount () {
      let account = new RepoAccount({
        type: this.form.type,
        name: this.form.user
      })

      account.save().then(account => {
        this.cancelAddAccountDialog()
        this.showSelectRepoDialog()
      })
    },

    addRepoByURL () {
      let repo = new Repository({
        type: 'github',
        url: this.form.url
      })

      repo.save().finally(() => {
        this.cancelAddRepoByURLDialog()
        this.fetchRepositories()
      })
    },

    async updateRepoByURL () {
      let repo = await Repository.find(this.form.id)

      repo.type = 'github'
      repo.url = this.form.url

      repo.save().finally(() => {
        this.settingsRepoFormDialog = false
        this.fetchRepositories()
      })
    },

    openSettingsFormModal (repo) {
      this.form.id = repo.id
      this.form.type = 'url'
      this.form.url = repo.url
      this.form.mirror = true

      this.settingsRepoFormDialog = true
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
  padding: 0;
}

.labels {
  margin-top: 20px;

  .el-button {
    text-transform: none;
  }
}
</style>