import Vue from 'vue'
import Router from 'vue-router'

import OverviewPage from '@/pages/OverviewPage'
import SignPage from '@/pages/SignPage'

import FunctionsPage from '@/pages/FunctionsPage'
import FunctionsCreatePage from '@/pages/FunctionsCreatePage'
import FunctionsViewPage from '@/pages/FunctionsViewPage'
import FunctionsViewCodePage from '@/pages/FunctionsViewCodePage'
import FunctionsViewResourcesPage from '@/pages/FunctionsViewResourcesPage'
import FunctionsViewMiddlewarePage from '@/pages/FunctionsViewMiddlewarePage'
import FunctionsViewTriggersPage from '@/pages/FunctionsViewTriggersPage'
import ObjectStoragePage from '@/pages/ObjectStoragePage'
import BucketViewPage from '@/pages/BucketViewPage'
import MariaDBPage from '@/pages/MariaDBPage'
import MongoDBPage from '@/pages/MongoDBPage'
import StatsPage from '@/pages/StatsPage'
import StatsFunctionsPage from '@/pages/StatsFunctionsPage'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '', redirect: '/functions' },
    {
      path: '',
      name: 'overview',
      component: OverviewPage
    },
    {
      path: '/sign',
      name: 'sign',
      component: SignPage,
      meta: {
        clearPage: true
      }
    },
    {
      path: '/functions',
      name: 'functions',
      component: FunctionsPage
    },
    {
      path: '/functions/create',
      name: 'functions.create',
      component: FunctionsCreatePage
    },
    {
      path: '/functions/view/:name',
      name: 'functions.view',
      component: FunctionsViewPage,
      children: [
        { path: 'code', name: 'functions.view.code', component: FunctionsViewCodePage },
        { path: 'resources', name: 'functions.view.resources', component: FunctionsViewResourcesPage },
        { path: 'middleware', name: 'functions.view.middleware', component: FunctionsViewMiddlewarePage },
        { path: 'triggers', name: 'functions.view.triggers', component: FunctionsViewTriggersPage }
      ]
    },
    {
      path: '/storage',
      name: 'storage',
      component: ObjectStoragePage
    },
    {
      path: '/storage/bucket/:name',
      name: 'bucket.view',
      component: BucketViewPage
    },
    {
      path: '/storage/bucket/:name/:prefix',
      name: 'bucket.view.prefix',
      component: BucketViewPage
    },
    {
      path: '/mariadb',
      name: 'mariadb',
      component: MariaDBPage
    },
    {
      path: '/mongodb',
      name: 'mongodb',
      component: MongoDBPage
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsPage,
      children: [
        { path: 'func', name: 'stats.func', component: StatsFunctionsPage },
        { path: 'storage', name: 'stats.storage', component: StatsFunctionsPage },
        { path: 'mariadb', name: 'stats.mariadb', component: StatsFunctionsPage },
        { path: 'mongodb', name: 'stats.mongodb', component: StatsFunctionsPage }
      ]
    }
  ]
})
