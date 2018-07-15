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
      <li v-for="(line, key) in logs" :key="key" :class="'logs__line ' + line.event.split('.').join(' ')">
        <span class="logs__datetime">{{ line.ts | moment("D/MM/YYYY H:m:s") }}</span>
        <span class="logs__event">{{ line.event}}</span>
        <span class="logs__text">{{ line.text }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { FunctionModel } from '@/models/functions'

export default {
  data () {
    return {
      function: new FunctionModel(),
      logs: [],
      loading: true
    }
  },
  created () {
    this.$store.dispatch('setParentPage', { name: 'functions', title: 'Functions' })
    this.$store.dispatch('setFunctionActiveTab', 'logs')

    this.function.id = this.$route.params.fid
    this.function.logs().then(response => {
      this.logs = response.response.data
    }).finally(() => {
      this.loading = false
    })
  }
}
</script>

<style lang="scss">
.logs {
  list-style: none;
  margin: 0;
  padding: 14px;
  font-family: monospace;
  font-size: 12px;
  line-height: 14px;

  background: #000;
}

.logs__line {
  color: #9b9b9b;
  margin-bottom: 5px;

  &.stdout {
    color: #fff;
  }

  &.stderr {
    color: #d0021b;
  }

  .logs__text {
    word-break: break-all;
  }
}

.download-link {
  color: #1989fa;
  margin-left: 30px;
}
</style>