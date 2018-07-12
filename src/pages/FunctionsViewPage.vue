<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="Code" name="code"></el-tab-pane>
      <el-tab-pane label="Resources" name="resources"></el-tab-pane>
      <el-tab-pane label="Middleware" name="middleware"></el-tab-pane>
      <el-tab-pane label="Triggers" name="triggers"></el-tab-pane>
      <el-tab-pane label="Logs" name="logs"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.dispatch('fetchFunctionByID', this.$route.params.fid).then(response => {
      this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
      this.$store.dispatch('setPageTitle', this.$store.getters.function.name)
    })
  },
  computed: {
    activeTab: {
      get () {
        return this.$store.getters.getFunctionActiveTab
      },
      set (val) {
        this.$store.dispatch('setFunctionActiveTab', val)
      }
    }
  },
  methods: {
    handleClick (tab, event) {
      this.$router.push({ name: 'functions.view.' + tab.name, params: { name: this.$route.params.name } })
    }
  }
}
</script>