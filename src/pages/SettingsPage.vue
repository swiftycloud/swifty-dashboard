<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <el-tabs v-model="activeTab">
      <!-- <el-tab-pane label="Plan" name="plan">
        <settings-plan></settings-plan>
      </el-tab-pane> -->
      <el-tab-pane label="Account" name="account">
        <settings-account></settings-account>
      </el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>

<script>
import SettingsPlan from '@/components/SettingsPlan'
import SettingsAccount from '@/components/SettingsAccount'

export default {
  components: { SettingsPlan, SettingsAccount },

  created () {
    this.$store.dispatch('setParentPage', { name: 'settings', title: 'Settings' })
  },

  computed: {
    activeTab: {
      get () {
        let val = this.$route.params.tab
        this.$store.dispatch('setParentPage', { name: 'settings', title: 'Settings' })
        this.$store.dispatch('setPageTitle', val.charAt(0).toUpperCase() + val.slice(1))
        return val
      },
      set (val) {
        this.$router.push({name: 'settings', params: { tab: val }})
      }
    }
  }
}
</script>