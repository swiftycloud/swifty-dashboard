<template>
  <el-card class="sign-card" v-loading="loadingStatus">
    <el-tabs>
      <el-tab-pane label="Sign In">
        <sign-in-form></sign-in-form>
      </el-tab-pane>
      <el-tab-pane label="Sign Up">
        <sign-up-form></sign-up-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import SignInForm from '@/components/SignInForm'
import SignUpForm from '@/components/SignUpForm'
import NavbarMini from '@/components/NavbarMini'

export default {
  components: { SignInForm, SignUpForm, NavbarMini },
  computed: {
    loadingStatus () {
      return this.$store.state.page.signLoadingStatus
    }
  }
}
</script>