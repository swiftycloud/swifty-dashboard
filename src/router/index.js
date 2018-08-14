/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

import Vue from 'vue'
import Router from 'vue-router'

import OverviewPage from '@/pages/OverviewPage'
import SignPage from '@/pages/SignPage'

const FunctionsPage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsPage')
const FunctionsCreatePage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsCreatePage')
const FunctionsViewPage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewPage')
const FunctionsViewCodePage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewCodePage')
const FunctionsViewResourcesPage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewResourcesPage')
const FunctionsViewMiddlewarePage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewMiddlewarePage')
const FunctionsViewTriggersPage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewTriggersPage')
const FunctionsViewLogsPage = () => import(/* webpackChunkName: "functions" */ '@/pages/FunctionsViewLogsPage')
const BucketsPage = () => import(/* webpackChunkName: "s3" */ '@/pages/BucketsPage')
const BucketsViewPage = () => import(/* webpackChunkName: "s3" */ '@/pages/BucketsViewPage')
const MariaDBPage = () => import(/* webpackChunkName: "mware" */ '@/pages/MariaDBPage')
const MongoDBPage = () => import(/* webpackChunkName: "mware" */ '@/pages/MongoDBPage')
const StatsPage = () => import(/* webpackChunkName: "stats" */ '@/pages/StatsPage')
const StatsFunctionsPage = () => import(/* webpackChunkName: "stats" */ '@/pages/StatsFunctionsPage')
const StatsObjectStoragePage = () => import(/* webpackChunkName: "stats" */ '@/pages/StatsObjectStoragePage')
const StatsMongoPage = () => import(/* webpackChunkName: "stats" */ '@/pages/StatsMongoPage')
const StatsMariaPage = () => import(/* webpackChunkName: "stats" */ '@/pages/StatsMariaPage')
const AuthServicePage = () => import(/* webpackChunkName: "authservice" */ '@/pages/AuthServicePage')
const RepositoriesPage = () => import(/* webpackChunkName: "repositories" */ '@/pages/RepositoriesPage')
const AdminUsersPage = () => import(/* webpackChunkName: "admin" */ '@/pages/AdminUsersPage')
const AccountsPage = () => import(/* webpackChunkName: "accounts" */ '@/pages/AccountsPage')

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
      path: '/functions/view/:fid',
      name: 'functions.view',
      component: FunctionsViewPage,
      children: [
        { path: 'code', name: 'functions.view.code', component: FunctionsViewCodePage },
        { path: 'resources', name: 'functions.view.resources', component: FunctionsViewResourcesPage },
        { path: 'access', name: 'functions.view.access', component: FunctionsViewMiddlewarePage },
        { path: 'triggers', name: 'functions.view.triggers', component: FunctionsViewTriggersPage },
        { path: 'logs', name: 'functions.view.logs', component: FunctionsViewLogsPage }
      ]
    },
    {
      path: '/storage',
      name: 'storage',
      component: BucketsPage
    },
    {
      path: '/storage/bucket/:name',
      name: 'bucket.view',
      component: BucketsViewPage
    },
    {
      path: '/storage/bucket/:name/:prefix',
      name: 'bucket.view.prefix',
      component: BucketsViewPage
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
        { path: 'storage', name: 'stats.storage', component: StatsObjectStoragePage },
        { path: 'mariadb', name: 'stats.mariadb', component: StatsMariaPage },
        { path: 'mongodb', name: 'stats.mongodb', component: StatsMongoPage }
      ]
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthServicePage
    },
    {
      path: '/repositories',
      name: 'repositories',
      component: RepositoriesPage
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsPage
    },
    {
      path: '/admin/users',
      name: 'admin.users',
      component: AdminUsersPage
    }
  ]
})
