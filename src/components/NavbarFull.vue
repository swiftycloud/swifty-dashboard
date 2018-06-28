<!-- 

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <nav class="navbar">
    <div class="navbar-brand-block" :class="{ 'sidebar-showed' : !$store.state.sidebar.hidden }">
      <a href="#" class="sidebar-shower" @click.prevent="showSidebar"><i class="fa el-icon-menu"></i></a>
      <a href="/" class="navbar-brand">swifty.</a>
      <a href="#" class="sidebar-hidder" @click.prevent="hideSidebar"><i class="fa el-icon-arrow-left"></i></a>
    </div>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-if="this.$store.getters.getParentPage" :to="{ name: $store.getters.getParentPage.name }">
        {{ $store.getters.getParentPage.title }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ mainPageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>


    <div class="navbar-forms">
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input placeholder="Search"></el-input>
        </el-form-item>
      </el-form>

      <el-form :inline="true" class="project-form">
        <el-form-item label="Project: ">
          <el-select v-model="currentProject" placeholder="Select">
            <el-option key="default" label="Default" value="default"></el-option>
            <el-option
              v-for="item in $store.getters.getProjects"
              :key="item.project"
              :label="item.project"
              :value="item.project">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </nav>
</template>

<script>
import { UPDATE_CURRENT_PROJECT } from '@/store/mutation-types'

export default {
  computed: {
    mainPageTitle () {
      return this.$store.state.page.title ? this.$store.state.page.title : this.$route.name
    },
    currentProject: {
      get () {
        return this.$store.state.projects.currentProject
      },
      set (value) {
        this.$store.commit(UPDATE_CURRENT_PROJECT, value)
      }
    }
  },
  watch: {
    '$route': function () {
      this.$store.dispatch('setParentPage', null)
    }
  },
  methods: {
    showSidebar () {
      this.$store.dispatch('showSidebar')
    },
    hideSidebar () {
      this.$store.dispatch('hideSidebar')
    }
  }
}
</script>
