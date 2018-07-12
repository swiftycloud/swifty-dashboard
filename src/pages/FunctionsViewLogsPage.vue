<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div v-loading="loading">
    <p>
      Function log
      <a href="#" class="download-link">Download as ZIP</a>
    </p>

    <ul class="logs">
      <li v-for="(line, k) in logs" v-key="k">
        <span class="logs__datetime">{{ line.ts }}</span>
        <span class="logs__event">{{ line.event}}</span>
        <span class="logs__text">{{ line.text }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      logs: '',
      loading: true
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'logs')
    this.fetchLogs()
  },
  methods: {
    fetchLogs () {
      this.loading = true

      return api.functions.one(this.$route.params.fid).logs.get().then(response => {
        this.logs = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>
.logs {
  list-style: none;
  margin: 0;
  padding: 14px;
  font-family: monospace;
  font-size: 12px;
  line-height: 14px;

  background: #000;
}

.logs__datetime {
  color: #d0021b;
}

.logs__event {
  color: #fff;
}

.logs__text {
  color: #9b9b9b;
}

.download-link {
  color: #1989fa;
  margin-left: 30px;
}
</style>