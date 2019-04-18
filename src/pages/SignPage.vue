<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <el-card class="sign-card" :class="{ localsign : localSign }" v-loading="loadingStatus">
    <el-tabs>
      <el-tab-pane label="Sign In">
        <sign-in-form></sign-in-form>
      </el-tab-pane>
      <el-tab-pane label="Sign Up" v-if="localSign">
        <sign-up-form></sign-up-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import config from '@/api/config'

import SignInForm from '@/components/SignInForm'
import SignUpForm from '@/components/SignUpForm'
import NavbarMini from '@/components/NavbarMini'

export default {
  components: { SignInForm, SignUpForm, NavbarMini },
  computed: {
    loadingStatus () {
      return this.$store.state.page.signLoadingStatus
    },

    localSign () {
      return config.LOCALSIGN
    }
  }
}
</script>
