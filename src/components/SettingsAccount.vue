<template>
  <div class="settings-account">
    <el-row>
      <el-col :span="6">
        <div class="label">Name</div>
        <div class="field">{{ $store.state.auth.user.name }}</div>

        <div class="label">Email</div>
        <div class="field">{{ $store.state.auth.user.uid }}</div>

        <el-form label-position="top" ref="passwordForm" :model="form" :rules="rules">
          <el-form-item label="Old password">
            <el-input type="password" v-model="form.oldPassword" placeholder="********"></el-input>
          </el-form-item>
          <el-form-item label="New password">
            <el-input type="password" v-model="form.newPassword" placeholder="********"></el-input>
          </el-form-item>

          <el-button type="primary" @click="changePassword">Change password</el-button>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      form: {
        oldPassword: null,
        newPassword: null
      },
      rules: {
        oldPassword: [
          { required: true, message: 'Please enter your current password', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: 'Please enter your new password', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    changePassword () {
      this.$refs['passwordForm'].validate(valid => {
        if (valid) {
          api.users.one('me').pass({
            current: this.form.oldPassword,
            password: this.form.newPassword
          }).then(response => {
            this.$message({
              message: 'Your password has changed',
              type: 'success'
            })

            this.form.oldPassword = null
            this.form.newPassword = null
          }).catch(error => {
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Something wrong'
            })
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.settings-account {
  .label {
    font-size: 16px;
    padding-bottom: 16px;
  }

  .field {
    font-size: 16px;
    margin-bottom: 20px;
    color: #909399;
  }

  .el-form-item:not(:last-of-type) {
    margin-bottom: 0;
  }

  .el-form-item__label {
    font-size: 16px;
    color: #000;
  }
}
</style>