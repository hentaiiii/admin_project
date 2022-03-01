<!-- 角色管理 -->
<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-input
        v-model="tempSearchObj.roleName"
        placeholder="角色名称"
        style="width: 150px; margin-right: 15px"
      />
      <el-button type="primary" icon="el-icon-search" @click="searchRole">查询</el-button>
      <el-button @click="clear">清空</el-button>
    </div>
    <el-row>
      <el-button type="primary" @click="addRole">添加</el-button>
      <el-button type="danger" :disabled="selectRoleList.length === 0" @click="deleteRoles">批量删除</el-button>
    </el-row>
    <!-- table 表格区域 -->
    <el-table
      ref="multipleTable"
      :data="roleList"
      tooltip-effect="dark"
      style="width: 60%; margin:20px 0"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" />
      <el-table-column type="index" label="序号" width="100" />
      <el-table-column label="角色名称">
        <template slot-scope="{row}">
          <div v-if="row.edit" class="edit-content">
            <el-input v-model="row.roleName" size="small" />
            <el-button type="warning" icon="el-icon-refresh" size="small" @click="concelUpdateRole(row)">取消</el-button>
          </div>
          <div v-else>{{ row.roleName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="300">
        <template slot-scope="{ row }">
          <HintButton
            icon="el-icon-info"
            type="info"
            title="分配权限"
            size="mini"
            @click="$router.push(`/acl/role/auth/${row.id}?roleName=${row.roleName}`)"
          />
          <HintButton
            v-if="!row.edit"
            icon="el-icon-edit"
            type="primary"
            title="修改角色"
            size="mini"
            @click="row.edit = true"
          />
          <HintButton
            v-else
            icon="el-icon-check"
            type="primary"
            title="确定"
            size="mini"
            @click="updataRole(row)"
          />
          <el-popconfirm
            title="这是一段内容确定删除吗？"
            @onConfirm="deleteRole(row.id)"
          >
            <HintButton
              slot="reference"
              icon="el-icon-delete"
              type="danger"
              title="删除角色"
              size="mini"
            />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页列表 -->
    <el-pagination
      :current-page="page"
      :page-sizes="[5, 10, 20, 30,40,50]"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="getRoleList"
    />
  </div>
</template>

<script>
export default {
  name: 'Role',
  data() {
    return {
      searchObj: {
        roleName: ''
      },
      tempSearchObj: {
        roleName: ''
      },
      roleList: [], // 所有角色列表
      selectRoleList: [], // 选中的角色列表
      loading: false,
      page: 1, // 当前页
      limit: 5, // 当前页数量
      total: 0,
    }
  },
  mounted() {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色列表
    async getRoleList(page = 1) {
      // page, limit, searchObj roleName
      this.page = page
      const { limit, searchObj } = this
      const res = await this.$api.role.getPageList(page, limit, searchObj)
      if (res.code === 20000) {
        const { items, total } = res.data
        this.total = total
        this.roleList = items.map(item => {
          item.edit = false // 标识是否进入编辑状态
          item.originName = item.roleName // 用于取消时保存角色名称
          return item
        })
      }
    },
    // table表格选中
    handleSelectionChange(selectRoleList) {
      this.selectRoleList = selectRoleList
    },
    // 分页每页个数改变回调
    handleSizeChange(limit) {
      this.limit = limit
      this.getRoleList()
    },
    // 查询角色
    searchRole() {
      this.searchObj = { ...this.tempSearchObj }
      this.getRoleList()
    },
    // 清空搜索数据
    clear() {
      this.searchObj = {
        roleName: ''
      }
      this.tempSearchObj = {
        roleName: ''
      }
      this.getRoleList()
    },
    // 添加角色
    addRole() {
      this.$prompt('请输入新名称', '添加角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async({ value }) => {
        // 发送请求
        if (value) {
          const res = await this.$api.role.save({ roleName: value })
          if (res.code === 20000) {
            this.$message.success('添加成功!')
            this.getRoleList()
          }
        } else {
          this.$message.warning('输入不能为空')
        }
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '取消添加'
        })
      })
    },
    // 更新角色
    updataRole(row) {
      const { roleName, originName, id } = row
      if (roleName === originName) {
        this.$message.warning('请输入新的角色名称')
      } else {
        this.$api.role.updateById({ id, roleName }).then(res => {
          this.$message.success('修改成功！')
          this.getRoleList(this.page)
        })
      }
    },
    // 取消修改角色
    concelUpdateRole(row) {
      row.roleName = row.originName
      row.edit = false
      this.$message.warning('已取消修改!')
    },
    // 删除角色
    deleteRole(id) {
      this.$api.role.removeById(id).then(() => {
        this.$message.success('删除成功！')
        this.getRoleList(this.roleList.length === 1 ? this.page - 1 : this.page)
      }).catch(() => {
        this.$message.error('删除失败！请稍后重试')
      })
    },
    // 批量删除用户角色
    deleteRoles() {
      const ids = this.selectRoleList.map(item => item.id)
      this.$confirm('是否批量删除用户角色', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await this.$api.role.removeRoles(ids)
        if (res.code === 20000) {
          this.$message.success('批量删除成功!')
          this.getRoleList()
        }
      }).catch(() => {
        this.$message.info('已取消删除！')
      })
    }
  }
}
</script>
<style>
.edit-content{
  display: flex;
}
.el-input {
  margin-right: 10px;
}
</style>
