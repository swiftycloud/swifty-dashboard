<template>
  <div class="settings-plan">
    <p class="description">You are currently on <strong>{{ currentPlan }}</strong> plan. Please upgrade your plan to get more benefits.<br>
    All plans are free to use during beta period! We will automatically charge you when the service goes production.</p>

    <el-row :gutter="12">
      <el-col :span="7" v-for="plan in plans" :key="plan.name">
        <el-card class="plan-card" :class="{ current : currentPlan === plan.name }" shadow="never">
          <div slot="header" class="header">
            {{ plan.name }}
          </div>
          <div class="per-month">
            ${{ plan.per_month }}/per month            
            <div class="notice" v-if="plan.notice">
              {{ plan.notice }}
            </div>
          </div>

          <ul class="features">
            <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
          </ul>

          <div class="footer">
            <div class="read-more">
              <a href="#">Read More</a>
            </div>
            <el-button type="primary" disabled v-if="currentPlan === plan.name">Current Plan</el-button>
            <el-button type="primary" v-else @click="currentPlan = plan.name">Select</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      plans: [
        {
          name: 'Free',
          per_month: 0,
          features: [
            'All features of Swifty',
            'Up to 100 requests per second',
            '3 seconds timeout',
            '10000 GB-s included',
            'etc'
          ]
        },
        {
          name: 'Starter',
          per_month: 10,
          notice: '(free during beta)',
          features: [
            'All features of Swifty',
            'Up to 100 requests per second',
            '3 seconds timeout',
            '10000 GB-s included',
            'etc'
          ]
        },
        {
          name: 'Pay-as-you-Go',
          per_month: 0,
          notice: '(free during beta)',
          features: [
            'All features of Swifty',
            'Up to 100 requests per second',
            '3 seconds timeout',
            '10000 GB-s included',
            'etc'
          ]
        }
      ],

      currentPlan: 'Free'
    }
  }
}
</script>

<style lang="scss">
.settings-plan {
  .description {
    font-size: 16px;
  }
}

.plan-card {
  text-align: center;
  font-size: 16px;
  min-height: 520px;
  position: relative;

  .header {
    text-transform: uppercase;
    color: #1989fa;
  }

  &.current .el-card__header {
    border-bottom: 1px solid #1989fa;
  }

  .per-month {
    font-size: 20px;
    line-height: 1.4;
    height: 58px;
  }

  .notice {
    font-size: 16px;
    color: #d0021b;
  }

  .features {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;

    li {
      line-height: 2.57;
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    padding-bottom: 35px;
    width: 100%;

    .read-more {
      margin: 35px 0;

      a {
        font-size: 14px;
        color: #1989fa;
      }
    }
  }
}
</style>