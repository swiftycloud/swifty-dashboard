<template>
  <div v-loading="loading">
    <p>Please enter resource properties for your function</p>

    <div class="actions-block">
      <el-button type="primary" size="medium" @click="updateResources">Save</el-button>
    </div>

    <el-popover
      ref="memorypopover"
      placement="right"
      title="Memory Limit"
      width="400"
      trigger="hover"
      content="Maximum amount of RAM available for the function.">
    </el-popover>

    <el-popover
      ref="timeoutpopover"
      placement="right"
      title="Timeout"
      width="400"
      trigger="hover"
      content="If the function has not completed by the timeout duration, then the function will be terminated. The default is 60 seconds.">
    </el-popover>

    <!--<el-popover
      ref="rpspopover"
      placement="right"
      title="Request per second"
      width="400"
      trigger="hover"
      content="Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.">
    </el-popover>
  -->

    <el-row>
      <el-col :span="24">
        <el-form label-width="170px" v-model="form" class="resource-form">
          <el-form-item label="Memory Limit">
            <el-select placeholder="Memory Limit" v-model="form.memory">
              <el-option v-for="(value, label) in $store.getters.getFunctionResources.memory" :label="label" :value="value" :key="value"></el-option>
            </el-select>
            <a href="#" @click.prevent class="input-info" v-popover:memorypopover>
              <span class="fa-stack fa-sm">
                <i class="fa fa-circle-thin fa-stack-2x"></i>
                <i class="fa fa-info fa-stack-1x"></i>
              </span>
            </a>
          </el-form-item>
          <el-form-item label="Timeout">
            <el-select placeholder="Timeout" v-model="form.timeout">
              <el-option v-for="(value, label) in $store.getters.getFunctionResources.timeout" :label="label" :value="value" :key="value"></el-option>
            </el-select>
            <a href="#" @click.prevent class="input-info" v-popover:timeoutpopover>
              <span class="fa-stack">
                <i class="fa fa-circle-thin fa-stack-2x"></i>
                <i class="fa fa-info fa-stack-1x"></i>
              </span>
            </a>
          </el-form-item>
          <!--<el-form-item label="Requests per second">
            <el-select placeholder="Requests per second" v-model="form.rate">
              <el-option v-for="(value, label) in $store.getters.getFunctionResources.rps" :label="label" :value="value" :key="value"></el-option>
            </el-select>
            <a href="#" @click.prevent class="input-info" v-popover:rpspopover>
              <span class="fa-stack">
                <i class="fa fa-circle-thin fa-stack-2x"></i>
                <i class="fa fa-info fa-stack-1x"></i>
              </span>
            </a>
          </el-form-item>
        -->
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
        memory: null,
        timeout: null,
        rate: null
      },
      loading: true
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'resources')
    this.$store.dispatch('fetchFunctionInfo', {
      project: this.$store.getters.currentProject,
      name: this.$route.params.name
    }).then(response => {
      this.form = response.data.size
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    updateResources () {
      this.loading = true
      this.$store.dispatch('updateFunction', {
        project: this.$store.getters.currentProject,
        name: this.$route.params.name,
        size: this.form
      }).then(response => {
        this.$notify.success({
          title: 'Success',
          message: 'Resources saved'
        })
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.input-info {
  margin-left: 10px;
  color: rgba(0, 0, 0, 0.54);

  .fa-stack {
    height: 30px;
  }
}

.resource-form {
  margin-top: 10px;
}
</style>
