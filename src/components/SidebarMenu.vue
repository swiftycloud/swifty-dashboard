<template>
  <nav class="sidebar-menu">
    <!--<router-link to="/" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Overview</a></router-link>-->
    <router-link to="/functions" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Functions</a></router-link>
    <!--<a href="#/functions" class="nav-link"><i class="fa fa-square"></i> <span>Functions</span></a>-->
    <router-link to="/storage" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Object Storage</a></router-link>
    <router-link to="/mariadb" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Maria Database</a></router-link>
    <!--<a href="#" class="nav-link"><i class="fa fa-square"></i> <span>PostgreSQL</span></a>-->
    <router-link to="/mongodb" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Mongo Database</a></router-link>
    <div class="divider"></div>
    <router-link :to="{ name: 'stats.func', params: { name: 'Functions' } }" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Statistics</a></router-link>
    <router-link to="/settings" class="nav-link" active-class="active" exact><a><i class="fa el-icon-arrow-right"></i>Settings</a></router-link>
  </nav>
</template>

<style lang="scss">
  aside {
    min-width: 256px;
  }
</style>
