<template>
  <div v-loading="loading">
    <p>Usage stats for MongoDB</p>

    <el-row>
      <el-col :span="24">
        <el-table :data="mongoStats" style="width: 100%">
          <el-table-column prop="name" label=""></el-table-column>
          <el-table-column prop="period" label="All Period"></el-table-column>
          <el-table-column prop="limit" label="Tariff Plan Limit"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <div class="actions-block">
      <el-button type="primary">Upgrade Plan</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      mongoStats: [
        { name: 'Used Storage, GB', period: 0, limit: null },
        { name: 'Number of databases', period: 0, limit: null }
      ]
    }
  },

  created () {
    this.$store.dispatch('setStatsActiveTab', 'mongodb')
    this.fetchMwareStats()
  },

  methods: {
    fetchMwareStats () {
      this.loading = true
      this.$store.dispatch('fetchMiddlewareList', {
        type: 'mongo',
        project: this.$store.getters.project
      }).then(response => {
        if (response.data !== null) {
          response.data.forEach(item => {
            if (item.type === 'mongo') {
              this.mongoStats[0].period += item.disk_usage || 0
              this.mongoStats[1].period += 1
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .timeline-form {
    .period {
      padding: 0 17px;
    }
  }

  .text-red {
    color: #d0021b;
  }

  .actions-block {
    margin-top: 40px;
  }
</style>
