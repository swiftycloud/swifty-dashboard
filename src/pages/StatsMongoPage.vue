<template>
  <div v-loading="loading">
    <p>Usage stats for your functions</p>

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
        <el-table :data="mongoStats" style="width: 100%">
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
      mongoStats: [
        { name: 'Used Storage, GB', period: 8, limit: 10 },
        { name: 'Number of databases', period: 1, limit: 5 }
      ]
    }
  },

  created () {
    this.$store.dispatch('setStatsActiveTab', 'mongodb')
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
