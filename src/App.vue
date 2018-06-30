<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div id="app">
    <transition name="fade">
      <div class="app-loading" v-if="appLoadingState">
        <div class="app-loading-content">
          <i class="fa fa-cog fa-spin"></i>
          <p class="brand">swifty.</p>
          <p>ver: 2018-05-15</p>
        </div>
      </div>
    </transition>
    <el-container v-if="!$store.getters.getAppLoadingState">
      <navbar-full v-if="!$route.meta.clearPage"></navbar-full>
      <navbar-mini v-if="$route.meta.clearPage"></navbar-mini>
      <sidebar v-if="!$route.meta.clearPage && !sidebarHidden"></sidebar>
      <el-container>
        <el-main>
          <router-view/>
        </el-main>
        <el-footer height="63px">
          <el-row>
            <el-col :span="20">
              © 2018 SwiftyCloud OÜ. All rights reserved.
            </el-col>
            <el-col :span="2" style="text-align: right">
              <a href="mailto:info@swifty.cloud">Contact Us</a>
            </el-col>
            <el-col :span="2" style="text-align: right">
              0.51
            </el-col>
          </el-row>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import NavbarFull from '@/components/NavbarFull'
import NavbarMini from '@/components/NavbarMini'
import Sidebar from '@/components/Sidebar'

import { mapGetters } from 'vuex'

export default {
  name: 'app',
  computed: {
    ...mapGetters({
      sidebarHidden: 'checkHiddenStatus',
      appLoadingState: 'getAppLoadingState'
    })
  },
  components: { NavbarFull, Sidebar, NavbarMini }
}
</script>
