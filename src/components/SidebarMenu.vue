<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <nav class="sidebar-menu">
    <router-link v-if="!isHidden('functions')" :to="{ name: 'functions' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Functions</router-link>
    <div class="divider"></div>
    <router-link v-if="!isHidden('storage')" :to="{ name: 'storage' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Object Storage</router-link>
    <router-link v-if="!isHidden('mariadb')" :to="{ name: 'mariadb' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Maria Database</router-link>
    <router-link v-if="!isHidden('mongodb')" :to="{ name: 'mongodb' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Mongo Database</router-link>
    <router-link v-if="!isHidden('auth')" :to="{ name: 'auth' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Authentication Service</router-link>
    <div class="divider"></div>    
    <router-link v-if="!isHidden('repositories')" :to="{ name: 'repositories' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Repositories</router-link>
    <router-link v-if="!isHidden('accounts')" :to="{ name: 'accounts' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Accounts</router-link>
    <router-link v-if="!isHidden('stats')" :to="{ name: 'stats.func' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Statistics</router-link>
    <div class="divider"></div> 
    <router-link v-if="!isHidden('settings')" :to="{ name: 'settings', params: { tab: 'account' } }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Settings</router-link>

    <span v-if="$store.getters.getUserInfo.roles.includes('swifty.admin')">
      <div class="divider"></div> 
      <router-link v-if="!isHidden('admin.users')" :to="{ name: 'admin.users' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Users</router-link>
    </span>
  </nav>
</template>

<script>
import config from '@/api/config'

export default {
  methods: {
    isHidden (section) {
      if (!config.SWY_HIDDEN_SECTIONS) return false
      return config.SWY_HIDDEN_SECTIONS.includes(section)
    }
  }
}
</script>

<style lang="scss">
  aside {
    min-width: 256px;
  }
</style>
