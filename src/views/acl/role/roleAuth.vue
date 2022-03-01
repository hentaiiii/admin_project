<!-- 角色授权 -->
<template>
  <div>
    <el-input v-model="$route.query.roleName" disabled />
    <el-tree
      ref="tree"
      style="margin: 20px 0"
      :data="permissionList"
      show-checkbox
      node-key="id"
      default-expand-all
      :props="defaultProps"
    />
    <el-row>
      <el-button type="primary" :loading="loading" @click="save">保存</el-button>
      <!-- <el-button @click="$router.replace('/acl/role/list')">取消</el-button> -->
      <el-button @click="$router.replace({name: 'Role'})">取消</el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Auth',
  data() {
    return {
      permissionList: [], // 角色权限列表
      defaultProps: { //  设置树形列表节点属性的解析字段
        children: 'children',
        label: 'name'
      },
      loading: false
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const roleId = this.$route.params.id
      this.getPermissionList(roleId)
    },
    async getPermissionList(roleId) {
      const res = await this.$api.permission.toAssign(roleId)
      if (res.code === 20000) {
        const permissionList = res.data.children
        this.permissionList = permissionList
        const checkedIds = this.getCheckedIds(permissionList)
        this.$refs.tree.setCheckedKeys(checkedIds)
      }
    },
    // 获取选中的ids数组
    getCheckedIds(auth, tempArr = []) {
      return auth.reduce((pre, item) => {
        if (item.level === 4 && item.select) {
          // 保存
          pre.push(item.id)
        } else if (item.children) {
          // 递归
          this.getCheckedIds(item.children, tempArr)
        }
        return pre
      }, tempArr)
    },
    // 保存
    async save() {
      /*
      vue elementUI tree树形控件获取父节点ID的实例
      修改源码:
      情况1: element-ui没有实现按需引入打包
        node_modules\element-ui\lib\element-ui.common.js    25382行修改源码  去掉 'includeHalfChecked &&'
        // if ((child.checked || includeHalfChecked && child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
        if ((child.checked || child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
      情况2: element-ui实现了按需引入打包
        node_modules\element-ui\lib\tree.js    1051行修改源码  去掉 'includeHalfChecked &&'
        // if ((child.checked || includeHalfChecked && child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
        if ((child.checked || child.indeterminate) && (!leafOnly || leafOnly && child.isLeaf)) {
      */
      const ids = this.$refs.tree.getCheckedKeys().join(',')
      this.loading = true
      const res = await this.$api.permission.doAssign(this.$route.params.id, ids)
      if (res.code === 20000) {
        this.$message.success('分配权限成功!')
        // const roleName = this.$route.query.roleName
        // const roles = this.$store.getters.roles
        this.$router.replace('/acl/role/list')
      }
    }
  }
}

</script>
<style lang="less" scoped>
</style>
