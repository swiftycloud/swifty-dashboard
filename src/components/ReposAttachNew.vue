<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div>
    <el-button type="primary" size="medium" @click="showAttachRepoDialog">Attach Repo</el-button>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="attachRepoDialogVisibility"
      @close="modalClose">
      <div v-if="form.step == 1" v-loading="loading">
        <el-form label-width="170px">
          <el-form-item label="Repository Type">
            <el-select v-model="form.type" :disabled="loading">
              <el-option label="GitHub" value="github"></el-option>
              <el-option label="Git URL" value="giturl"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Personal Access Token" v-if="form.type === 'github'" style="margin-bottom: 0;">
            <el-input v-model="form.token" placeholder="xhgchxcgyycxtcve536dfvdtf5vhsc63vv36v" :disabled="loading"></el-input>
          </el-form-item>

          <el-form-item label="Git Repository URL" style="margin-bottom: 0" v-if="form.type === 'giturl'">
            <el-input v-model="form.url" placeholder="https://username:password@github.com/user/repo.git"></el-input>
          </el-form-item>
          <el-form-item v-if="form.type === 'giturl'">
            <el-checkbox label="Mirror repository automatically" v-model="form.mirror"></el-checkbox>
            <el-popover
              ref="mirror"
              placement="right"
              title="Repository Mirroring"
              width="400"
              trigger="hover">
              Automatically update this project's branches and tags from the upstream repository every hour.<br><a href='#' class="primary">More details</a>

              <span class="fa-stack mirror-info" slot="reference">
                <i class="fa fa-circle-thin fa-stack-2x"></i>
                <i class="fa fa-info fa-stack-1x"></i>
              </span>
            </el-popover>
          </el-form-item>
        </el-form>
        <p v-if="form.type === 'github'">
          To integrate with GitHub you need to generate a <a href="https://github.com/settings/tokens" target="_blank" class="primary">Personal Access Token</a>. When you create your Personal Access Token, you will need to select the repo scope, so we can display a list of your public and private repositories which are available to connect.
        </p>
        <p v-if="form.type === 'giturl'">
          The repository must be accessible over http://, https:// or git://.<br>
          If your HTTP repository is not publicly accessible, add authentication information to the URL like:
          https://username:password@github.com/user/repo.git.<br>
        </p>
        <span slot="footer" class="dialog-footer text-left">
          <el-button @click="cancelAddAccountDialog">Cancel</el-button>
          <el-button type="primary" v-if="form.type === 'github'" :disabled="!form.token && !form.user" @click="addAccount">Next</el-button>
          <el-button type="primary" v-if="form.type === 'giturl'" :disabled="!form.url" @click="addGitURL">Done</el-button>
        </span>
      </div>

      <div v-if="form.step == 2">
        <ul class="repos">
          <li class="repos__item">Repository Name</li>
          <li v-for="repo in repositories" v-if="repo.url" class="repos__item">
            {{ repo.url }}
            <el-button plain type="primary" size="small" class="repos__button pull-right" v-if="repo.state === 'unattached'" @click="attachRepo(repo)">connect</el-button>
            <el-button plain type="success" size="small" class="repos__button pull-right" v-if="repo.state !== 'unattached'" @click="deattachRepo(repo)">connected</el-button>
          </li>
        </ul>
        <span slot="footer" class="dialog-footer text-left">
          <el-button @click="cancelAddAccountDialog">Cancel</el-button>
          <el-button type="primary" @click="cancelAddAccountDialog">Done</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Repository from '@/models/Repository'
import RepoAccount from '@/models/RepoAccount'

export default {
  data () {
    return {
      attachRepoDialogVisibility: false,
      form: {
        step: 1,
        type: 'github',
        mirror: true,
        token: null,
        user: null,
        aid: null,
        url: null
      },
      account: {},
      repositories: [],
      dialogTitle: 'Add new repository',
      loading: false
    }
  },

  methods: {
    showAttachRepoDialog () {
      this.dialogTitle = 'Add new repository'
      this.form.step = 1
      this.form.type = 'github'
      this.form.token = this.form.user = this.form.url = this.form.aid = null
      this.form.mirror = true
      this.attachRepoDialogVisibility = true

      RepoAccount.params({
        type: 'github'
      }).first().then(account => {
        this.form.token = account.token
        this.form.user = account.name
        this.form.aid = account.id
      })
    },

    cancelAddAccountDialog () {
      this.attachRepoDialogVisibility = false
    },

    async addAccount () {
      this.loading = true

      let account = new RepoAccount({
        type: this.form.type,
        name: this.form.user
      })

      if (this.form.token.length === 40) {
        account.token = this.form.token
      }

      if (this.form.aid !== null) {
        account.id = this.form.aid
      }

      await account.save()
      this.form.aid = account.id

      Repository.params({
        aid: account.id
      }).get().then(repos => {
        this.repositories = repos

        this.dialogTitle = 'Select Repository'
        this.form.step = 2
        this.loading = false
      })
    },

    attachRepo (item) {
      let repo = new Repository({
        type: item.type,
        url: item.url,
        account_id: this.form.aid
      })

      repo.save().then(response => {
        item.state = 'attached'
        item.id = response.id
      })
    },

    deattachRepo (item) {
      item.delete().then(() => {
        item.state = 'unattached'
      })
    },

    addGitURL () {
      let repo = new Repository({
        url: this.form.url,
        type: 'github',
        pulling: this.form.mirror ? 'periodic' : null
      })

      repo.save().then(() => {
        this.cancelAddAccountDialog()
      })
    },

    modalClose () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.repos {
  list-style: none;
  padding: 0;
  margin: 0;
  margin: 0 0 50px 0;
}

.repos__item {
  line-height: 48px;
  padding: 0 7px;
  border-bottom: 1px solid #ebeef5;
}

.repos__item:hover {
  background: #f5f7fa;
}

.repos__item:first-child {
  color: #909399;
}

.repos__button {
  margin-top: 8px !important;
}
</style>
