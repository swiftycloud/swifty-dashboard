<template>
  <div v-loading="loading">
    <p>Usage stats for storage</p>

    <el-row>
      <el-col :span="24">
        <el-form label-width="170px" class="timeline-form">
          <el-form-item label="Timeline">
            <el-select placeholder="Timeline" v-model="periods">
              <el-option v-for="(value, label) in $store.getters.getPeriods" :label="label" :value="value" :key="value"></el-option>
            </el-select>
            <span class="period">from 04/05/2018 to 05/05/2018</span>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-table :data="storageStats" style="width: 100%">
          <el-table-column prop="name" label=""></el-table-column>
          <el-table-column prop="period" label="Chosen Period"></el-table-column>
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

      periods: 0,
      storageStats: [
        { name: 'Used Storage, GB', period: 0.012, limit: 10 },
        { name: 'Outbound Traffic, GB', period: 0.211, limit: 200 }
      ]
    }
  },

  created () {
    this.$store.dispatch('setStatsActiveTab', 'storage')
    this.fetchObjectStats()
  },

  methods: {
    async fetchObjectStats () {
      let data = await this.$store.dispatch('fetchS3ListBuckets', {
        project: this.$store.getters.currentProject
      })

      for (var k in data.Buckets) {
        let bucket = data.Buckets[k]
        let bytes = await this.$store.dispatch('getMetricStatistics', {
          project: this.$store.getters.currentProject,
          data: {
            Namespace: 'AWS/S3',
            MetricName: 'NumberOfObjects',
            StartTime: 0,
            EndTime: new Date(),
            Period: 86400,
            Statistics: ['Average'],
            Unit: 'Count',
            Dimensions: [
              {
                'Name': 'BucketName',
                'Value': bucket.Name
              }, {
                'Name': 'StorageType',
                'Value': 'AllStorageTypes'
              }
            ]
          }
        })

        console.log(bytes)
      }
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

  .actions-block {
    margin-top: 40px;
  }
</style>
