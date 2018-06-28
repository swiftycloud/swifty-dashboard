<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="sign-in-form">
    <!-- <ul class="list-unstyled social-buttons">
      <li><el-button type="primary">Google</el-button></li>
      <li><el-button type="primary">Facebook</el-button></li>
      <li><el-button type="primary">GitHub</el-button></li>
    </ul> -->

    <el-form label-width="120px" :model="form" :rules="rules" ref="signInForm" @submit="submitForm('signInForm')">
      <el-form-item label="Your email:" prop="email">
        <el-input placeholder="Email" type="email" v-model="form.email" @keyup.enter.native="submitForm('signInForm')"></el-input>
      </el-form-item>
      <el-form-item label="Password:" prop="password">
        <el-input placeholder="Password" type="password" v-model="form.password" @keyup.enter.native="submitForm('signInForm')"></el-input>
      </el-form-item>
    </el-form>

    <ul class="sign-in-button">
      <li><el-button type="primary" @click="submitForm('signInForm')">Sign In</el-button></li>
    </ul>

    <ul class="sign-in-links">
      <li><small><a href="#">Don’t remember your password?</a></small></li>
      <li><a href="#">Don’t have an account? Sign up!</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        email: null,
        password: null,
        router: this.$router
      },
      rules: {
        email: [
          { required: true, message: 'Please enter your email', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please enter your password', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$store.dispatch('setSignLoadingStatus', true)

          this.$store.dispatch('userSignIn', this.form).then(response => {
            this.$store.dispatch('setSignLoadingStatus', false)
            const backUrl = sessionStorage.getItem('history.back')

            if (backUrl !== undefined) {
              this.$router.push({ path: backUrl })
            } else {
              this.$router.push({ name: 'functions' })
            }
          }).catch(error => {
            this.$store.dispatch('setSignLoadingStatus', false)

            if (error.response.status === 401) {
              this.$message.error('Sign in was failed')
            } else {
              this.$message.error('Opps. Unknown error')
              console.log(error.message)
            }
          })
        }
      })
    }
  }
}
</script>
