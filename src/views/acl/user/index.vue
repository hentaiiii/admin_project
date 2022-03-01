<!-- 用户管理 -->
<template>
  <div>
    <!-- 头部 -->
    <div>
      <el-input
        v-model="tempSearchObj.username"
        style="width: 200px; margin-right: 10px"
        placeholder="用户名"
      />
      <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
      <el-button @click="clearSearch">清空</el-button>
    </div>
    <div style="margin: 15px 0">
      <el-button type="primary" @click="showAddUserDialog">添加</el-button>
      <el-button type="danger" icon="el-icon-delete" :disabled="selectUser.length === 0" @click="deleteUsers">批量删除</el-button>
    </div>
    <!-- table表格 -->
    <el-table ref="userTable" tooltip-effect="dark" style="width: 100%" border :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="100" align="center" />
      <el-table-column label="用户名" width="150" prop="username" />
      <el-table-column label="用户昵称" width="150" prop="nickName" />
      <el-table-column label="权限列表" prop="roleName" />
      <el-table-column label="创建时间" prop="gmtCreate" />
      <el-table-column label="更新时间" prop="gmtModified" />
      <el-table-column label="操作" width="230" align="center">
        <template slot-scope="{row}">
          <HintButton icon="el-icon-user-solid" type="info" title="分配角色" size="mini" @click="showAssignRole(row)" />
          <HintButton icon="el-icon-edit" type="primary" title="修改用户" size="mini" @click="showUpdateUser(row)" />
          <el-popconfirm
            :title="`确定删除${row.username}吗？`"
            @onConfirm="deleteUser(row.id)"
          >
            <HintButton slot="reference" icon="el-icon-delete" type="danger" title="删除用户" size="mini" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <!--  @size-change="handleSizeChange"   @current-change="handleCurrentChange"  :current-page.sync="currentPage3"-->
    <el-pagination
      style="margin-top: 15px"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :page-sizes="[3, 10, 20, 30, 40, 50, 100]"
      :total="total"
      :current-page="page"
      @current-change="getUsers"
      @size-change="handleSizeChange"
    />
    <!-- 添加或修改用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialog"
      width="50%"
    >
      <el-form ref="ruleForm" :model="user" :rules="rules" label-width="120px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="user.nickName" />
        </el-form-item>
        <el-form-item v-if="!user.id" label="用户密码" prop="password">
          <el-input v-model="user.password" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditUser">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="addOrEditUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="设置角色"
      :visible.sync="addRoleDialog"
      width="50%"
      :before-close="resetRoleData"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input disabled :value="user.username" />
        </el-form-item>
        <el-form-item label="角色列表">
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="userRoleIds" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="role in allRolesList" :key="role.id" :label="role.id">{{ role.roleName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="assignRole">保 存</el-button>
        <el-button @click="resetRoleData">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'User',
  data() {
    return {
      total: 0, // 总数量
      page: 1, // 当前页码
      limit: 3, // 每页个数
      searchObj: {
        username: ''
      },
      tempSearchObj: {
        username: ''
      },
      userList: [], // 用户列表
      selectUser: [], // 选中的user列表
      addUserDialog: false,
      user: {}, // 当前操作的user
      rules: {
        username: [
          { required: true, message: '用户名必须输入' },
          { min: 4, message: '用户名不能小于4位' }
        ],
        password: [
          { required: true, validator: this.validatePassword }
        ]
      },
      loading: false, // 是否正在提交请求中
      addRoleDialog: false, // 显示分配角色对话框的显示和隐藏
      allRolesList: [], // 所有角色列表
      checkAll: false, // 是否全选
      isIndeterminate: true, // 是否是不确定的
      userRoleIds: [] // 用户角色的id列表
    }
  },
  mounted() {
    // 获取数据
    this.getUsers()
  },
  methods: {
    async getUsers(page = 1) {
      this.page = page
      const { limit, searchObj } = this
      const res = await this.$api.user.getPageList(page, limit, searchObj)
      if (res.code === 20000) {
        this.total = res.data.total
        this.userList = res.data.items
        this.userRoleIds = []
      }
    },
    // 选中table
    handleSelectionChange(user) {
      this.selectUser = user
    },
    // 页面数量改变
    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.getUsers()
    },
    // 查询用户
    search() {
      this.searchObj = { ...this.tempSearchObj }
      if (this.searchObj.username === '') {
        this.$message.warning('输入不能为空')
      }
      this.getUsers()
    },
    // 清空搜索用户输入框
    clear() {
      this.searchObj = {
        username: ''
      }
      this.tempSearchObj = {
        username: ''
      }
      this.getUsers()
    },
    // 弹出添加用户对话框
    showAddUserDialog() {
      this.user = {}
      this.addUserDialog = true
      // 清空所有规则提示
      this.$nextTick(() => this.$refs.ruleForm.clearValidate())
    },
    // 自定义密码校验
    validatePassword(rule, value, callback) {
      if (!value) {
        callback('密码必须输入!')
      } else if (!value || value.length < 6) {
        callback('密码必须大于6位!')
      } else {
        callback()
      }
    },
    // 取消添加或者修改用户
    cancelEditUser() {
      // 清空数组
      this.addUserDialog = false
      this.user = {}
    },
    showUpdateUser(user) {
      // 显示修改用户对话框
      this.user = cloneDeep(user)
      this.addUserDialog = true
    },
    // 添加或者修改用户
    addOrEditUser() {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) {
          this.$message.error('请输入正确的用户信息')
        } else {
          this.loading = true
          const { user } = this
          // 更新或者保存用户
          const res = await this.$api.user[ user.id ? 'update' : 'add' ](user)
          if (res.code === 20000) {
            this.$message.success('更新成功')
            this.loading = false
            this.addUserDialog = false
            this.getUsers(user.id ? this.page : 1)
            this.user = {}
          } else {
            this.$message.error('更新失败，请稍后重试!')
          }
        }
      })
    },
    // 关闭对话框重置分配角色数据
    resetRoleData() {
      this.addRoleDialog = false
      this.userRoleIds = []
      this.allRolesList = []
    },
    showAssignRole(row) {
      this.user = row
      this.addRoleDialog = true
      this.getRoleList()
    },
    // 异步获取角色列表
    async getRoleList() {
      const res = await this.$api.user.getRoles(this.user.id)
      if (res.code === 20000) {
        this.allRolesList = res.data.allRolesList
        this.userRoleIds = res.data.assignRoles.map(item => item.id)
      }
    },
    // 是否全选
    handleCheckAllChange(checked) {
      this.userRoleIds = checked ? this.allRolesList.map(item => item.id) : []
      this.isIndeterminate = false
    },
    // 是否选中单个复选框角色
    handleCheckedCitiesChange() {
      // 判断全选是否勾选
      const { allRolesList, userRoleIds } = this
      this.checkAll = allRolesList.length === userRoleIds.length && userRoleIds.length > 0
      this.isIndeterminate = !this.checkAll
    },
    // 分配用户角色
    async assignRole() {
      const { user } = this
      const roleId = this.userRoleIds.join(',')
      const res = await this.$api.user.assignRoles(user.id, roleId)
      if (res.code === 20000) {
        this.$message.success('分配成功')
        this.addRoleDialog = false
        this.getUsers(user.id ? this.page : 1)
      }
    },
    // 删除用户
    async deleteUser(id) {
      const res = await this.$api.user.removeById(id)
      if (res.code === 20000) {
        this.$message.success('删除成功！')
        this.getUsers(this.userList.length === 1 ? this.page - 1 : this.page)
      }
    },
    // 批量删除多个用户
    deleteUsers() {
      this.$confirm('确定删除吗？').then(async() => {
        const ids = this.selectUser.map(item => item.id)
        const res = await this.$api.user.removeUsers(ids)
        if (res.code === 20000) {
          this.$message.success('删除成功！')
          this.getUsers(1)
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    // 清空
    clearSearch() {
      this.userList = []
      this.searchObj = {
        username: ''
      }
      this.tempSearchObj = {
        username: ''
      }
      this.getUsers()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
