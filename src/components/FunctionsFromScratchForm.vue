<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="function-scratch-form">
    <el-form ref="functionForm" label-width="120px" :model="form" :rules="rules" @submit="submitFunctionForm">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="18" :md="14" :lg="10">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" :autofocus="true"></el-input>
          </el-form-item>
          <el-form-item label="Language" prop="code.lang">
            <el-select placeholder="Please select language" v-model="form.code.lang" style="width: 100%">
              <el-option
                v-for="(lang, k) in $store.getters.getFunctionLangs"
                :label="lang"
                :value="lang"
                :key="k">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <br>
          <el-button @click="$router.push({ name: 'functions' })">Cancel</el-button>
          <el-button type="primary" @click="submitFunctionForm">Create</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    var validateFunctionName = (rule, value, callback) => {
      if (/^[A-z0-9_.]+$/.test(value) === false) {
        callback(new Error('Please input correct function name'))
      } else {
        callback()
      }
    }

    return {
      form: {
        project: this.$store.getters.currentProject,
        name: null,
        sources: { type: 'code', code: '' },
        code: { lang: 'python' },
        event: { source: 'url' },
        userdata: ''
      },

      rules: {
        name: [
          { required: true, message: 'Please enter function name', trigger: 'blur' },
          { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
          { validator: validateFunctionName, trigger: 'blur' }
        ],
        code: {
          lang: [
            { required: true, message: 'Please select function language', trigger: 'blur' }
          ]
        }
      }
    }
  },

  methods: {
    submitFunctionForm () {
      this.$refs.functionForm.validate((valid) => {
        if (valid) {
          this.$store.dispatch('createFunction', this.form).then(response => {
            this.$router.push({ name: 'functions.view.code', params: { fid: response.data.id } })
          }).catch((error) => {
            this.form.project = this.$store.getters.project
            this.$notify.error({
              title: 'Error',
              message: error.response.data.message || 'Function creating was failed'
            })
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style>
.function-scratch-form {
  margin-top: 20px;
}
</style>
