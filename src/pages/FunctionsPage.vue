<!--

© 2018 SwiftyCloud OÜ. All rights reserved.
Contact: info@swifty.cloud

-->

<template>
  <div class="page-content">
    <p>Here you can manage your functions</p>

    <div class="row">
      <div class="col">
        <div class="actions-block">
          <el-button type="primary" size="medium" @click="$router.push({ name: 'functions.create' })">New function</el-button>
          <el-button
          type="primary"
           size="medium"
           plain
           @click="manageAuthDialogVisibility = true"
           :disabled="this.selectedItems.length === 0">
          Manage authentication
          </el-button>
          <el-button
          type="primary"
           size="medium"
           plain
           @click="enableSelected()"
           :disabled="this.selectedItems.length === 0">
          Enable
          </el-button>
          <el-button
           size="medium"
           plain
           @click="disableSelected"
           :disabled="this.selectedItems.length === 0">
            Disable
          </el-button>          
          <el-button
            size="medium"
            plain
            @click="deleteSelected()"
            :disabled="this.selectedItems.length === 0">
            Delete
          </el-button>
        </div>
      </div>
    </div>

    <div class="labels">
      <el-button plain size="mini" @click="label = 'all'">All</el-button>
      <el-button plain size="mini" @click="label = 'none'">No label</el-button>
      <el-button :plain="label != 'auth'" size="mini" @click="label = 'auth'" type="danger">Authentication</el-button>
    </div>

    <div class="row">
      <div class="col">
        <el-table
          ref="multipleTable"
          :data="filtredTree"
          style="width: 100%"
          :row-class-name="tableRowClassName"
          @cell-click="clickHandler">
          <div slot="empty">
              <p>You don’t have any functions</p>
              <el-button type="primary" size="mini" round @click="$router.push({ name: 'functions.create' })">Create</el-button>
          </div>
          <el-table-column
            type="selected"
            width="55">
            <template slot-scope="scope">
              <input type="checkbox" v-model="selectedItems" :value="scope.row.id" @change="handleSelectionChange(scope.row)">
            </template>
          </el-table-column>
          <el-table-tree-column 
            file-icon="fa fa-file-o" 
            folder-icon="fa fa-folder"
            prop="name" label="Name" :indent-size="20"
            show-overflow-tooltip>            
            <template slot-scope="scope">
              <span class="name folder" v-if="scope.row.child_num"><a href @click.prevent>{{ scope.row.name }}</a></span>
              <span class="name" v-else>
                <router-link :to="{ name: 'functions.view.code', params: { fid: scope.row.id } }">{{ scope.row.name }}</router-link>
              </span>
            </template>
          </el-table-tree-column>
          <el-table-column
            prop="labels"
            label="Labels"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.labels !== undefined" v-for="v in scope.row.labels" :key="v">
                <el-tag size="mini" v-if="v === 'auth'" type="danger">Authentication</el-tag>
              </span>
              <span v-if="scope.row.labels === undefined && !scope.row.child_num">
                <el-tag size="mini" type="info">No labels</el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="state"
            label="Status"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            label="Authentication"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="!scope.row.child_num">
                <span v-if="scope.row.authctx"><i class="fa fa-lock" aria-hidden="true"></i></span>
                <span v-else><i class="fa fa-unlock-alt" aria-hidden="true"></i></span>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastcall"
            label="Last Run">
            <template slot-scope="scope" v-if="scope.row.stats && !scope.row.child_num">
              <el-tooltip
                effect="dark"
                :content="scope.row.stats[0].lastcall | moment('YYYY-MM-DD HH:mm:ss')"
                placement="right">
                <span v-if="'lastcall' in scope.row.stats[0]">{{ scope.row.stats[0].lastcall | moment('from', 'now') }}</span>
              </el-tooltip>
              <span v-if="scope.row.stats === null || !('lastcall' in scope.row.stats[0])">never</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="Manage Authentication For Your Functions"
      :visible.sync="manageAuthDialogVisibility"
      width="600px">
      <el-form ref="authForm" :model="authForm" label-width="200px" :rules="authFormRules">
        <el-form-item label="Authentication Service" prop="service">
          <el-select v-model="authForm.service" placeholder="Authentication Service">
            <el-option v-for="service in authServices.models" :value="service.id" :label="service.name" :key="service.id"></el-option>
          </el-select>
          <el-popover
            ref="authinfo"
            placement="right"
            title="Authentication Database"
            width="350"
            trigger="hover"
            content="If you do not have any Authentication Databases, please create one using Authentication Service.">
          </el-popover>
          <a href="#" @click.prevent class="input-info" v-popover:authinfo>
            <span class="fa-stack fa-sm">
              <i class="fa fa-circle-thin fa-stack-2x"></i>
              <i class="fa fa-info fa-stack-1x"></i>
            </span>
          </a>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="manageAuthDialogVisibility = false">Cancel</el-button>
        <el-button type="primary" @click="enableAuthentication">Enable</el-button>
        <el-button type="danger" @click="disableAuthentication">Disable</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'
import { AuthServiceList } from '@/models/auth_services'

function treeParse (tree, functions, expandedItems, parentKey, depthVal) {
  let depth = depthVal || 0
  let result = []

  for (let k in tree) {
    let value = tree[k]
    let current = {
      id: value.Path,
      name: value.Name,
      path: value.Path,
      parent_id: parentKey,
      depth: depth,
      child_num: value.Kids.length,
      children: [],
      stats: false
    }

    if (current.child_num === 0) {
      let func = functions.find(item => (item.name + '.') === current.path)

      if (func !== undefined) {
        current.id = func.id
        current.state = func.state
        current.stats = func.stats
        current.authctx = !!func.authctx
        current.labels = func.labels
      }
    } else {
      current.expanded = expandedItems.includes(current.id)
      current.children = treeParse(value.Kids, functions, expandedItems, current.id, depth + 1)
    }

    result.push(current)
  }

  return result.sort((a, b) => {
    if (a.name > b.name) return 1
    if (a.name < b.name) return -1
    return 0
  }).sort((a, b) => {
    if (a.children.length > b.children.length) return -1
    if (a.children.length < b.children.length) return 1
    return 0
  })
}

function selectChildren (selectedItems, children) {
  children.forEach(item => {
    selectedItems.push(item.id)
    if (item.child_num) {
      selectedItems = selectChildren(selectedItems, item.children)
    }
  })

  return selectedItems
}

function unselectChildren (selectedItems, children) {
  children.forEach(item => {
    delete selectedItems[selectedItems.indexOf(item.id)]
    if (item.child_num) {
      selectedItems = unselectChildren(selectedItems, item.children)
    }
  })

  return selectedItems
}

function setExpanded (id, tree, expanded) {
  tree.forEach(item => {
    if (item.child_num) {
      if (item.id === id) {
        item.expanded = expanded
      }

      setExpanded(id, item.children, expanded)
    }
  })
}

function getFunctionsId (selected, items, ids) {
  items.forEach(item => {
    if (selected.includes(item.id)) {
      if (item.child_num === 0) {
        ids.push(item.id)
      }
    }

    if (item.child_num) {
      ids = getFunctionsId(selected, item.children, ids)
    }
  })

  return ids
}

export default {
  data () {
    return {
      items: [],
      tree: [],
      selectedItems: [],
      expandedItems: [],

      authServices: new AuthServiceList(),
      manageAuthDialogVisibility: false,

      // forms
      authForm: {
        service: ''
      },

      // rules
      authFormRules: {
        service: [
          { required: true, message: 'Please select Authentication Service', trigger: 'change' }
        ]
      },

      label: 'all'
    }
  },

  created () {
    this.fetchItems()
    this.authServices.fetch()
  },

  computed: {
    filtredTree () {
      if (this.label === 'all') {
        return this.tree
      } else {
        return this.items.filter(item => {
          if (this.label === 'none') {
            return item.labels === undefined || item.labels.length === 0
          }

          return item.labels && item.labels.length && item.labels.includes(this.label)
        })
      }
    }
  },

  methods: {
    tableRowClassName ({ row, rowIndex }) {
      return row.state === 'deactivated' ? 'deactivated-func' : ''
    },

    handleSelectionChange (val) {
      if (val.child_num) {
        if (!this.selectedItems.includes(val.id)) {
          this.selectedItems = unselectChildren(this.selectedItems, val.children)
        } else {
          this.selectedItems = selectChildren(this.selectedItems, val.children)
        }
      }
    },

    fetchItems () {
      return api.functions.find('tree', { leafs: true }).then(response => {
        let tree = response.data.Kids

        api.functions.get({ details: true }).then(response => {
          this.items = response.data
          this.tree = []

          this.$nextTick(() => {
            this.tree = treeParse(tree, response.data, this.expandedItems)
          })
        })
      })
    },

    clickHandler (row, column, cell, event) {
      if (column.property === 'name' && row.child_num) {
        if (this.expandedItems.includes(row.id)) {
          delete this.expandedItems.indexOf(row.id)
          setExpanded(row.id, this.tree, false)
        } else {
          this.expandedItems.push(row.id)
          setExpanded(row.id, this.tree, true)
        }
      }
    },

    /*
     * Enable & Disable functions
     */
    enableSelected () {
      if (this.selectedItems.length === 0) {
        return false
      }
      this.$confirm('Selected function will be enabled', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        let selectedFunctions = getFunctionsId(this.selectedItems, this.tree, [])

        var promises = []
        selectedFunctions.forEach(id => {
          promises.push(api.functions.update(id, {
            state: 'ready'
          }))
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchItems()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    disableSelected () {
      if (this.selectedItems.length === 0) {
        return false
      }

      this.$confirm('Selected function will be disabled', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let selectedFunctions = getFunctionsId(this.selectedItems, this.tree, [])

        var promises = []
        selectedFunctions.forEach(id => {
          promises.push(api.functions.update(id, {
            state: 'deactivated'
          }))
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchItems()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    /*
     * Delete functions
     */
    deleteSelected () {
      if (this.selectedItems.length === 0) {
        return false
      }

      this.$confirm('Selected functions will be deleted', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let selectedFunctions = getFunctionsId(this.selectedItems, this.tree, [])

        var promises = []
        selectedFunctions.forEach(id => {
          promises.push(this.$store.dispatch('deleteFunctionByID', id))
        })

        return Promise.all(promises)
      }).then(() => {
        return this.fetchItems()
      }).catch(error => {
        this.$notify.error({
          title: 'Error',
          message: error.response.data.message
        })
      }).finally(() => {
        this.loading = false
      })
    },

    /*
     * Enable & Disable authentication
     */
    enableAuthentication () {
      if (this.selectedItems.length === 0) {
        this.$notify.error({
          title: 'Error',
          message: 'No function selected'
        })

        return false
      }

      this.$refs['authForm'].validate((valid) => {
        if (valid) {
          this.$confirm('Authentication will be enabled for selected functions', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.loading = true
            return api.deployments.find(this.authForm.service)
          }).then(response => {
            var mwareName = null
            response.data.items.forEach(item => {
              if (item.type === 'mware' && /^.+_jwt$/.test(item.name)) {
                mwareName = item.name
              }
            })

            let selectedFunctions = getFunctionsId(this.selectedItems, this.tree, [])

            var promises = []
            selectedFunctions.forEach(id => {
              let func = this.items.find(item => item.id === id)
              if ('labels' in func && func.labels.indexOf('auth') !== -1) {
                return false
              }

              promises.push(api.functions.one(id).authctx.update(null, JSON.stringify(mwareName)))
            })

            return Promise.all(promises)
          }).then(() => {
            this.manageAuthDialogVisibility = false
            return this.fetchItems()
          }).catch(() => {
            // ..
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    disableAuthentication () {
      if (this.selectedItems.length === 0) {
        return false
      }

      this.$confirm('Authentication will be disabled for selected functions', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loading = true

        let selectedFunctions = getFunctionsId(this.selectedItems, this.tree, [])

        var promises = []
        selectedFunctions.forEach(id => {
          let func = this.items.find(item => item.id === id)
          if ('labels' in func && func.labels.indexOf('auth') !== -1) {
            return false
          }

          promises.push(api.functions.one(id).authctx.update(null, JSON.stringify('')))
        })

        return Promise.all(promises)
      }).then(() => {
        this.manageAuthDialogVisibility = false
        return this.fetchItems()
      }).catch(() => {
        // ..
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.fa.fa-file-o {
  padding-left: 14px;
}

.deactivated-func td,
.deactivated-func td a,
.fa.fa-unlock-alt {
  color: #c3c3c3;
}

.name {
  padding-left: 10px;

  &.folder {
    cursor: pointer;
  }
}

.labels {
  margin-top: 20px;

  .el-button {
    text-transform: none;
  }
}
</style>