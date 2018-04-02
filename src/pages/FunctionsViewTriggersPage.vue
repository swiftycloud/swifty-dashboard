<template>
  <div v-loading="loading">
    <p>Here you can manage your triggers</p>

    <div class="actions-block">
      <el-button type="primary" size="medium">Add Trigger</el-button>
    </div>

    <hr>

    <el-row>
      <el-col :span="12">
        <p class="trigger-post-url-label">REST API</p>
      </el-col>
      <el-col :span="12">
        <!--<el-button type="primary" plain size="medium">Disable API</el-button>-->
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <p class="trigger-post-url">POST https://{{ url }}  <el-button size="mini" type="primary" v-clipboard:copy="'https://' + url" class="fa fa-copy" plain></el-button></p>
      </el-col>
    </el-row>

    <el-table
      ref="multipleTable"
      :data="triggers"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <div slot="empty" class="middleware-empty-message">
          <p>You don’t have any triggers attached to the function</p>
          <el-button type="primary" size="mini" round>Attach</el-button>
      </div>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        label="Name"
        sortable
        width="120">
      </el-table-column>
      <el-table-column
        property="status"
        label="Status"
        sortable
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="type"
        label="Type"
        sortable
        width="120">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      triggers: [],
      url: null,
      loading: true
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'triggers')
    this.$store.dispatch('fetchFunctionInfo', {
      project: this.$store.getters.currentProject,
      name: this.$route.params.name
    }).then(response => {
      this.url = response.data.url
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    handleSelectionChange () {
      // ..
    }
  }
}
</script>

<style lang="scss" scoped>
.trigger-post-url-label {
  line-height: 36px;
}
.trigger-post-url {
  color: #909399;
  font-size: 14px;
}
</style>
