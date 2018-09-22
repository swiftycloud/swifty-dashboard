<template>
  <div class="settings-account">
    <el-row>
      <el-col :span="6">
        <div class="label">Name</div>
        <div class="field">{{ $store.state.auth.user.name }}</div>

        <div class="label">Email</div>
        <div class="field">{{ $store.state.auth.user.uid }}</div>

        <el-form label-position="top">
          <el-form-item label="Old password">
            <el-input type="password" v-model="oldPassword" placeholder="********"></el-input>
          </el-form-item>
          <el-form-item label="New password">
            <el-input type="password" v-model="newPassword" placeholder="********"></el-input>
          </el-form-item>

          <el-button type="primary">Change password</el-button>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        oldPassword: null,
        newPassword: null
      }
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