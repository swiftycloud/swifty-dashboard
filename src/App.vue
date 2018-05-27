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
      <el-main>
        <router-view/>
      </el-main>
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
