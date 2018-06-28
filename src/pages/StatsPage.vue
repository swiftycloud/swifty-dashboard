<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="Functions" name="func"></el-tab-pane>
      <el-tab-pane label="Storage" name="storage"></el-tab-pane>
      <el-tab-pane label="MariaDB" name="mariadb"></el-tab-pane>
      <el-tab-pane label="MongoDB" name="mongodb"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.dispatch('setPageTitle', 'Statistics')
  },
  computed: {
    activeTab: {
      get () {
        return this.$store.getters.getStatsActiveTab
      },
      set (val) {
        this.$store.dispatch('setStatsActiveTab', val)
      }
    }
  },
  methods: {
    handleClick (tab, event) {
      this.$router.push({ name: 'stats.' + tab.name })
    }
  }
}
</script>
