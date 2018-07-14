<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="sidebar-user-block">
    <el-row>
      <el-col :span="9">
        <div>
          <img class="user-photo" src="../../static/user.png">
        </div>
      </el-col>
      <el-col :span="15" class="user-info">
        <p class="user-name">{{ $store.state.auth.user.name }}</p>
        <p class="user-email">{{ $store.state.auth.user.id }}</p>
      </el-col>
    </el-row>
    <el-dropdown trigger="click" placement="bottom-start" @command="handleCommand">
      <span class="el-dropdown-link caret-down">
        <i class="fa fa-caret-down"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="logout">Log Out</el-dropdown-item>
        <!--<el-dropdown-item>Change Settings</el-dropdown-item>-->
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  methods: {
    handleCommand (command) {
      if (command === 'logout') {
        this.$store.dispatch('userLogout', this.$router)
      }
    }
  }
}
</script>
