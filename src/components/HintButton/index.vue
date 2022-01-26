<!-- HintButton -->
<template>
  <!-- <el-tooltip
    class="item"
    effect="dark"
    :content="title"
    placement="top"
  >
    <el-button v-bind="$attrs" v-on="$listeners" />
  </el-tooltip> -->
  <a class="item" href="javascript:;" :title="title">
    <el-button v-bind="$attrs" v-on="$listeners" />
  </a>
</template>

<script>
export default {
  name: 'HintButton',
  props: {
    title: {
      default: '',
      type: String
    }
  },
  data() {
    return {}
  }
}
</script>
<style scoped>
a {
  margin:0 5px;
}
</style>
