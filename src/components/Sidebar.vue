<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <el-aside width="256px">
    <sidebar-user-block></sidebar-user-block>
    <sidebar-menu></sidebar-menu>
  </el-aside>
</template>

<script>
import SidebarUserBlock from '@/components/SidebarUserBlock'
import SidebarMenu from '@/components/SidebarMenu'

export default {
  components: { SidebarUserBlock, SidebarMenu }
}
</script>
