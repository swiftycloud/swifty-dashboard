<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <nav class="sidebar-menu">
    <!--<router-link to="/" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Overview</router-link>-->
    <router-link to="/functions" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Functions</router-link>
    <div class="divider"></div>
    <!--<a href="#/functions" class="nav-link"><i class="fa fa-square"></i> <span>Functions</span>-->
    <router-link to="/storage" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Object Storage</router-link>
    <router-link to="/mariadb" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Maria Database</router-link>
    <!--<a href="#" class="nav-link"><i class="fa fa-square"></i> <span>PostgreSQL</span>-->
    <router-link to="/mongodb" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Mongo Database</router-link>
    <router-link to="/auth" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Authentication Service</router-link>
    <div class="divider"></div>    
    <router-link :to="{ name: 'repositories' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Repositories</router-link>
    <router-link :to="{ name: 'stats.func' }" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Statistics</router-link>
    <!--<router-link to="/settings" class="nav-link" active-class="active" exact><i class="fa el-icon-arrow-right"></i>Settings</router-link>-->
  </nav>
</template>

<style lang="scss">
  aside {
    min-width: 256px;
  }
</style>
