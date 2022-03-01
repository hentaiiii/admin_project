<!-- 菜单管理 -->
<template>
  <div>
    <el-table
      :data="menuPermissionList"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      :expand-row-keys="expandKeys"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="code" label="权限值" />
      <el-table-column prop="toCode" label="跳转权限值" />
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <HintButton
            icon="el-icon-plus"
            type="primary"
            :title="row.level === 3 ? '添加功能':'添加菜单'"
            size="mini"
            :disabled="row.level === 4"
            @click="toAddPermission(row)"
          />
          <HintButton
            icon="el-icon-edit"
            type="warning"
            :title="row.level === 4 ? '修改功能':'修改菜单'"
            size="mini"
            :disabled="row.level === 1"
            @click="toUpdatePermission(row)"
          />
          <HintButton
            icon="el-icon-delete"
            type="danger"
            title="删除菜单"
            size="mini"
            :disabled="row.level === 1"
            @click="deletePermission(row.id)"
          />
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框  :before-close="handleClose"-->
    <el-dialog
      :title="getDialogTitle"
      :visible.sync="dialogPermissionVisible"
      width="50%"
    >
      <el-form ref="permission" :model="permission" :rules="permissionRules" label-width="120px">
        <el-form-item v-if="permission.level !== 2 && !permission.id" label="父级名称" prop="pname">
          <el-input v-model="permission.pname" disabled />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="permission.name" />
        </el-form-item>
        <el-form-item label="功能权限值" prop="code">
          <el-input v-model="permission.code" />
        </el-form-item>
        <el-form-item v-if="permission.level===4" label="跳转路由权限值" prop="toCode">
          <el-input v-model="permission.toCode" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 按钮功能权限校验的规则
const btnRules = {
  name: [{ required: true, message: '名称必须输入' }],
  code: [{ required: true, trigger: 'blur', message: '功能权限值必须输入' }]
}
// 菜单权限校验的规则
const menuRules = {
  name: [{ required: true, message: '名称必须输入' }],
  code: [{ required: true, message: '权限值必须输入' }]
}
export default {
  name: 'Permission',
  data() {
    return {
      menuPermissionList: [], // 菜单列表
      expandKeys: [], // 需要自动展开的项
      dialogPermissionVisible: false,
      permission: {
        level: 0,
        name: '',
        code: '',
        toCode: ''
        // type: 1 2
      }
    }
  },
  computed: {
    // 动态获取弹出框标题
    getDialogTitle() {
      const { id, level } = this.permission
      if (id) {
        return level === 4 ? '修改功能' : '修改菜单'
      } else {
        return level === 4 ? '添加功能' : `添加${level === 2 ? '一级' : '二级'}菜单`
      }
    },
    // 根据权限的等级来计算确定校验规则
    permissionRules() {
      return this.permission.level === 4 ? btnRules : menuRules
    }
  },
  mounted() {
    this.fetchPermissionList()
  },
  methods: {
    // 获取菜单列表
    async fetchPermissionList() {
      const res = await this.$api.permission.getPermissionList()
      if (res.code === 20000) {
        this.menuPermissionList = res.data.children
        // 自动展开第一项
        this.expandKeys = [this.menuPermissionList[0].id]
      }
    },
    // 显示添加权限的界面(菜单或功能)
    toAddPermission(row) {
      this.dialogPermissionVisible = true
      this.permission.level = row.level + 1
      this.permission.pid = row.id
      this.type = row.level === 4 ? 2 : 1
      this.permission.pname = row.name // 用于显示父名称 提交请求不需要
      // 清空校验
      this.$nextTick(() => {
        this.$refs.permission.clearValidate()
      })
    },
    // 显示修改菜单对话框
    toUpdatePermission(row) {
      this.dialogPermissionVisible = true
      this.permission = { ...row }
      this.permission.type = this.permission.level === 4 ? 2 : 1
      // 清空校验
      this.$nextTick(() => {
        this.$refs.permission.clearValidate()
      })
    },
    // 取消添加或者修改
    cancel() {
      this.dialogPermissionVisible = false
      this.permission = {
        level: 0,
        name: '',
        code: '',
        toCode: ''
        // type: 1 2
      }
    },
    // 添加或者修改
    addOrUpdate() {
      this.$refs.permission.validate(async valid => {
        if (valid) {
          // 发送请求
          // eslint-disable-next-line no-unused-vars
          const { pname, ...perm } = this.permission
          const res = await this.$api.permission[perm.id ? 'updatePermission' : 'addPermission'](perm)
          if (res.code === 20000) {
            this.$message.success(`${perm.id ? '修改' : '添加'}成功!`)
            this.cancel()
            this.fetchPermissionList()
          }
        }
      })
    },
    // 删除菜单
    deletePermission(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除
        this.$api.permission.removePermission(id)
        this.$message.success('删除成功!')
        this.fetchPermissionList()
      }).catch(() => {
        this.$message.error('删除失败！请稍后重试')
      })
    }

  }
}
</script>
<style lang="less" scoped>
</style>
