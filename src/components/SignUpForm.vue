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

    <el-form label-width="120px" :model="form" :rules="rules" ref="signUpForm" @submit="submitForm('signUpForm')">
      <el-form-item label="Your email:" prop="email">
        <el-input placeholder="Email" type="email" v-model="form.email" @keyup.enter.native="submitForm('signUpForm')"></el-input>
      </el-form-item>
      <el-form-item label="Your name:" prop="name">
        <el-input placeholder="John Smith" type="name" v-model="form.name" @keyup.enter.native="submitForm('signUpForm')"></el-input>
      </el-form-item>
      <el-form-item label="Password:" prop="password">
        <el-input placeholder="Password" type="password" v-model="form.password" @keyup.enter.native="submitForm('signUpForm')"></el-input>
      </el-form-item>
    </el-form>

    <ul class="list-unstyled sign-in-button">
      <li><el-button type="primary" @click="submitForm('signUpForm')">Sign Up</el-button></li>
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
        name: null,
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

          this.$store.dispatch('userSignUp', this.form).then(response => {
            this.$store.dispatch('setSignLoadingStatus', false)
            this.$router.push({ name: 'functions' })
          }).catch(error => {
            this.$store.dispatch('setSignLoadingStatus', false)

            if (error.response.status === 401) {
              this.$message.error('Sign up was failed')
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
