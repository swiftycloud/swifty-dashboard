<template>
  <div v-loading="loading">
    <p>Usage statistics for your functions</p>

    <div class="row" v-loading="loading">
      <div class="col">
        <el-table
          :data="functions"
          show-summary
          sum-text="Summary"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="Function Name"
            sortable
            width="200">
          </el-table-column>
          <el-table-column
            prop="memory"
            label="RAM"
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
            label="Execution Time, ms"
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
            property="lastcall"
            label="Last Call"
            sortable
            show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <br>
    <br>
    <div v-if="showCost">
      <p>Price per GB-s: ${{ price }}</p>
      <p>Total cost: ${{ sum }}</p>
    </div>
  </div>

</template>

<script>
export default {
  data () {
    return {
      loading: true,
      functions: [],
      functionList: [],
      functionsTemp: [],
      price: 0.00001667,
      sum: 0,
      showCost: false
    }
  },

  created () {
    this.fetchFunctions()
  },

  computed: {

  },
  methods: {
    totalCost () {
      var gbsSum = 0
      for (var i = 0; i < this.functions.length; i++) {
        gbsSum += this.functions[i].gbs
        this.sum = gbsSum * this.price
        console.log(this.sum)
        this.showCost = true
      }
    },

    fetchFunctions () {
      this.$store.dispatch('fetchFunctions', this.$store.getters.currentProject).then(() => {
        // this.loading = false
        console.log('test1')
        return this.fetchFunctionStats()
      })
    },

    async fetchFunctionStats () {
      for (const item of this.$store.getters.getFunctions) {
        await this.$store.dispatch('fetchFunctionInfo', {
          project: this.$store.getters.currentProject,
          name: item.name
        }).then(response => {
          console.log(response.data.called)
          this.functionsTemp.push({
            name: item.name,
            memory: response.data.size.memory,
            called: response.data.stats.called,
            time: response.data.stats.time,
            gbs: (response.data.size.memory / 1000) * (response.data.stats.time / 1024),
            lastcall: response.data.stats.lastcall
          })
        })
      }

      this.loading = false
      this.functions = this.functionsTemp
      this.totalCost()
    }
  }
}
</script>

<style lang="css">

</style>
