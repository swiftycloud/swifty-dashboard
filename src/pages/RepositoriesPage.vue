<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Here you can manage your remote repositories</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="importNewRepoFormDialog = true">Attach repo</el-button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <el-table
          :data="repositories.models"
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
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Import New Repository"
      :visible.sync="importNewRepoFormDialog">
      <el-form label-width="170px">
        <el-form-item label="Repository Type">
          <el-select v-model="form.type">
            <el-option label="GitHub" value="github"></el-option>
            <el-option label="Repo by URL" value="url"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Personal Access Token" v-if="form.type === 'github'">
          <el-input v-model="form.token" placeholder="xhgchxcgyycxtcve536dfvdtf5vhsc63vv36v"></el-input>
        </el-form-item>
        <el-form-item label="Git Repository URL" v-if="form.type === 'url'" style="margin-bottom: 0">
          <el-input v-model="form.url" placeholder="https://username:password@gitlab.company.com/group/project.git"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type === 'url'">
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
      <p v-if="form.type === 'github'">
        To integrate with GitHub you need to generate a <a href="#" class="primary">Personal Access Token</a>. When you create your Personal Access Token, you will need to select the repo scope, so we can display a list of your public and private repositories which are available to connect.
      </p>

      <p v-if="form.type === 'url'">
        The repository must be accessible over http://, https:// or git://.<br>
        If your HTTP repository is not publicly accessible, add authentication information to the URL like: 
        https://username:password@gitlab.company.com/group/project.git.<br>
        The import will time out after 180 minutes 0 seconds. For repositories that take longer, use a clone/push combination.
      </p>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="importNewRepoFormDialog = false">Cancel</el-button>
        <el-button type="primary" v-if="form.type === 'github'" :disabled="!form.token">Next</el-button>
        <el-button type="primary" v-if="form.type === 'url'" @click="attachRepoByURL" :disabled="!form.url">Done</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Repository Settings"
      :visible.sync="settingsRepoFormDialog">
      <el-form label-width="170px">
        <el-form-item label="Repository Type">
          <el-select v-model="form.type">
            <el-option label="GitHub" value="github"></el-option>
            <el-option label="Repo by URL" value="url"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Personal Access Token" v-if="form.type === 'github'">
          <el-input v-model="form.token" placeholder="xhgchxcgyycxtcve536dfvdtf5vhsc63vv36v"></el-input>
        </el-form-item>
        <el-form-item label="Git Repository URL" v-if="form.type === 'url'" style="margin-bottom: 0">
          <el-input v-model="form.url" placeholder="https://username:password@gitlab.company.com/group/project.git"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type === 'url'">
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
      <p v-if="form.type === 'github'">
        To integrate with GitHub you need to generate a <a href="#" class="primary">Personal Access Token</a>. When you create your Personal Access Token, you will need to select the repo scope, so we can display a list of your public and private repositories which are available to connect.
      </p>

      <p v-if="form.type === 'url'">
        The repository must be accessible over http://, https:// or git://.<br>
        If your HTTP repository is not publicly accessible, add authentication information to the URL like: 
        https://username:password@gitlab.company.com/group/project.git.<br>
        The import will time out after 180 minutes 0 seconds. For repositories that take longer, use a clone/push combination.
      </p>
      <span slot="footer" class="dialog-footer text-left">
        <el-button @click="settingsRepoFormDialog = false">Cancel</el-button>
        <el-button type="primary" v-if="form.type === 'github'" :disabled="!form.token">Next</el-button>
        <el-button type="primary" v-if="form.type === 'url'" @click="updateRepoByURL" :disabled="!form.url">Done</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { RepositoryList, Repository } from '@/models/repositories'

export default {
  data () {
    return {
      repositories: new RepositoryList(),

      form: {
        id: null,
        type: 'url',
        token: '',
        url: '',
        mirror: true
      },
      importNewRepoFormDialog: false,
      settingsRepoFormDialog: false
    }
  },

  created () {
    this.$store.dispatch('setPageTitle', 'Repositories')

    this.repositories.fetch()
  },

  methods: {
    attachRepoByURL () {
      let repo = new Repository({
        type: 'github',
        url: this.form.url
      })

      repo.save().finally(() => {
        this.importNewRepoFormDialog = false
        this.repositories.fetch()
      })
    },

    updateRepoByURL () {
      let repo = new Repository({ id: this.form.id })

      repo.type = 'github'
      repo.url = this.form.url

      repo.save().finally(() => {
        this.settingsRepoFormDialog = false
        this.repositories.fetch()
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
        this.repositories.fetch()
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

.repo-link, 
.repo-link:hover,
.repo-link:focus {
  color: #303133;
  text-transform: none;
  padding: 0;
}
</style>