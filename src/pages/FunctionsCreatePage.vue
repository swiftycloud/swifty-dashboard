<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Please create new function from scratch or based on a template</p>

    <el-form ref="functionForm" label-width="160px" :model="form" :rules="rules" v-loading="loading" @submit="submitFunctionForm">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="18" :md="14" :lg="10">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" :autofocus="true"></el-input>
          </el-form-item>
          <el-form-item label="Language">
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

      <el-row :gutter="20" class="template-radio-block">
        <el-col :xs="24" :sm="24" :md="12" :lg="10" v-for="template in templates" :key="template.id">
          <el-radio v-model="selectedTemplate" :label="template" border>
            <p class="title">{{ template.name }}</p>
            <p class="description">{{ template.description }}</p>
          </el-radio>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-button @click="$router.push({ name: 'functions' })">Cancel</el-button>
          <el-button type="primary" class="create-function-button" @click="submitFunctionForm">Create</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    var validateFunctionName = (rule, value, callback) => {
      if (/^[A-z0-9_]+$/.test(value) === false) {
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
          { required: true, message: 'Please enter function name', trigger: 'blue' },
          { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
          { validator: validateFunctionName, trigger: 'blur' }
        ]
      },
      loading: false,
      selectedTemplate: this.$store.getters.getFunctionTemplateByID(0),
      templates: []
    }
  },
  created () {
    this.setParentPage({ name: 'functions', title: 'Functions' })
    this.setPageTitle('New Function')
    this.templates = this.$store.getters.getFunctionTemplatesByLang(this.form.code.lang)
    this.$store.dispatch('fetchFunctionLangs')
  },
  watch: {
    selectedTemplate: function (val) {
      this.form.sources.code = btoa(val.source)
      this.form.userdata = JSON.stringify(val.args)
    },
    'form.code.lang': function (val) {
      this.templates = this.$store.getters.getFunctionTemplatesByLang(val)
    }
  },
  methods: {
    ...mapActions([
      'setParentPage',
      'setPageTitle',
      'createFunction',
      'createTestFunction',
      'fetchFunctionLangs'
    ]),

    submitFunctionForm () {
      this.$refs.functionForm.validate((valid) => {
        if (valid) {
          this.loading = true

          this.createFunction(this.form).then(response => {
            this.$router.push({ name: 'functions.view.code', params: { fid: response.data } })
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

<style lang="scss">
  .template-radio-block {
    margin: 20px 0;
    //width: 900px;
  }

  .create-function-button {
    padding-left: 50px;
    padding-right: 50px;
  }

  .el-radio.is-bordered {
    height: 122px !important;
    width: 100%;
    display: table;
    background: white;
    padding: 0 20px !important;
    margin: 10px 0;

    .el-radio__input,
    .el-radio__label {
      display: table-cell;
      vertical-align: middle;
    }

    .el-radio__input {
      width: 14px;
    }

    .el-radio__label {
      white-space: normal;
      padding: 22px 0 22px 20px;

      .title {
        font-size: 16px;
        color: #606266;
        margin-bottom: 13px;
      }

      .description {
        font-size: 14px;
        color: #909399;
        line-height: 1.71;
        margin-bottom: 0;
      }
    }
  }
</style>
