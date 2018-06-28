<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

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
            <span class="period">from {{ periodFrom | moment('L') }} to {{ periodTill | moment('L') }}</span>
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
      loading: true,

      periods: 0,
      periodFrom: null,
      periodTill: null,

      storageStats: [
        { name: 'Used Storage, GB', period: 0, limit: 10 },
        { name: 'Outbound Traffic, GB', period: 0, limit: 200 }
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
            MetricName: 'BucketSizeBytes',
            StartTime: 0,
            EndTime: 0,
            Period: 86400,
            Statistics: ['Average'],
            Unit: 'Bytes',
            Dimensions: [
              {
                'Name': 'BucketName',
                'Value': bucket.Name
              }, {
                'Name': 'StorageType',
                'Value': 'StandardStorage'
              }
            ]
          }
        })

        for (var i in bytes.Datapoints) {
          let datapoint = bytes.Datapoints[i]
          this.storageStats[0].period += (datapoint.Average / 1073741824)
        }
      }

      this.storageStats[0].period = this.storageStats[0].period.toLocaleString(undefined, { minimumFractionDigits: 6 })

      this.periodFrom = this.$store.state.auth.user.created
      this.periodTill = new Date()

      this.loading = false
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
