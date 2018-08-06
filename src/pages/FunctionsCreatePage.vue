<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Create new function from scratch or from template</p>

    <el-tabs>
      <el-tab-pane label="From Scratch">
        <functions-from-scratch-form></functions-from-scratch-form>
      </el-tab-pane>
      <el-tab-pane label="From Repo (Templates)">
        <functions-templates-form></functions-templates-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FunctionsFromScratchForm from '@/components/FunctionsFromScratchForm'
import FunctionsTemplatesForm from '@/components/FunctionsTemplatesForm'

export default {
  components: { FunctionsFromScratchForm, FunctionsTemplatesForm },

  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setPageTitle', 'New Function')
    this.$store.dispatch('fetchFunctionLangs')
  }
}
</script>