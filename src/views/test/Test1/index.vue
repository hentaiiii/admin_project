<!-- test1 -->
<template>
  <div>
    <el-button v-show="this.$store.state.user.buttons.indexOf('btn.Test1.add') !== -1" type="primary">test按钮1 添加</el-button>
    <el-button v-show="this.$store.state.user.buttons.indexOf('btn.Test1.update') !== -1" type="warning">test按钮1 修改</el-button>
    <el-button v-show="this.$store.state.user.buttons.indexOf('btn.Test1.remove') !== -1" type="danger">test按钮1 删除</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  }
}

</script>
<style lang="less" scoped>
</style>
