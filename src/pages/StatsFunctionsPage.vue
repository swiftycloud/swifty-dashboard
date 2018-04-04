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

    <el-row v-if="!showFunctionDetails">
      <el-col :span="24">
        <el-table :data="funcStats" style="width: 100%">
          <el-table-column prop="name" label=""></el-table-column>
          <el-table-column prop="period" label="Chosen Period"></el-table-column>
          <el-table-column prop="limit" label="Tariff Plan Limit"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="showFunctionDetails">
      <el-col :span="24">
        <el-table
          :data="functions"
          show-summary
          sum-text="Summary"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="Function Name"
            sortable>
          </el-table-column>
          <el-table-column
            prop="memory"
            label="RAM, MB"
            sortable
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            property="called"
            label="Requests"
            sortable
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            property="time"
            label="Execution Time, s"
            sortable
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            property="gbs"
            label="GB-s"
            sortable
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            property="traffic"
            label="Outbound traffic, MB"
            sortable
            show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <div class="actions-block">
      <el-button size="small" type="text" v-if="!showFunctionDetails" @click="showFunctionDetails = true">Show Function Details</el-button>
      <el-button size="small" type="text" v-if="showFunctionDetails" @click="showFunctionDetails = false">Hide Function Details</el-button>
    </div>

    <hr>
    <el-button type="primary">Upgrade Plan</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: true,
      showFunctionDetails: false,

      periods: 0,
      funcStats: [],

      functions: [],
      functionList: [],
      functionsTemp: [],
      showCost: false
    }
  },

  created () {
    this.fetchFunctions()
    this.fetchStats()
  },

  watch: {
    'periods': function () {
      this.fetchStats()
    }
  },

  methods: {
    totalCost () {
      var gbsSum = 0
      for (var i = 0; i < this.functions.length; i++) {
        gbsSum += this.functions[i].gbs
        this.sum = gbsSum * this.price
        this.showCost = true
      }
    },

    fetchStats () {
      this.$store.dispatch('getStats', { periods: this.periods }).then(response => {
        console.log(response.data)
        this.funcStats = [
          { name: 'Requests', period: response.data.stats[0].called, limit: '' },
          { name: 'GB-s', period: response.data.stats[0].gbs, limit: '' },
          { name: 'Outbound Traffic, MB', period: (response.data.stats[0].bytesout / 1048576), limit: '' }
        ]
      })
    },

    fetchFunctions () {
      this.$store.dispatch('fetchFunctions', this.$store.getters.currentProject).then(() => {
        return this.fetchFunctionStats()
      })
    },

    async fetchFunctionStats () {
      for (const item of this.$store.getters.getFunctions) {
        var response = await this.$store.dispatch('fetchFunctionInfo', {
          project: this.$store.getters.currentProject,
          name: item.name
        })

        this.functionsTemp.push({
          name: item.name,
          memory: response.data.size.memory,
          called: response.data.stats.called,
          time: (response.data.stats.time / 1000000000),
          gbs: (response.data.size.memory / 1000) * (response.data.stats.time / 1024),
          traffic: (response.data.stats.bytesout / 1048576)
        })
      }

      this.loading = false
      this.functions = this.functionsTemp
      this.totalCost()
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
    margin-top: 10px;
  }
</style>
