<!-- 三级分类的组件 -->
<template>
  <div>
    <el-form :inline="true" class="demo-form-inline" :disabled="isShowAddDiv">
      <el-form-item label="一级分类">
        <el-select v-model="selectCategoryForm.category1Id" placeholder="请选择" @change="getCategory2List">
          <el-option v-for="c1 in category1List" :key="c1.id" :label="c1.name" :value="c1.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select v-model="selectCategoryForm.category2Id" placeholder="请选择" @change="getCategory3List">
          <el-option v-for="c2 in category2List" :key="c2.id" :label="c2.name" :value="c2.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="selectCategoryForm.category3Id" placeholder="请选择" @change="changeCategory3">
          <el-option v-for="c3 in category3List" :key="c3.id" :label="c3.name" :value="c3.id" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CategorySelector',
  props: {
    isShowAddDiv: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      selectCategoryForm: {
        category1Id: '',
        category2Id: '',
        category3Id: ''
      },
      category1List: [],
      category2List: [],
      category3List: []
    }
  },
  mounted() {
    // 获取一级分类
    this.getCategory1List()
  },
  methods: {
    // 获取一级分类
    async getCategory1List() {
      const res = await this.$api.category.getCategorys1()
      if (res.code !== 200) {
        this.$message.error('获取数据失败，请刷新页面重试!')
      } else {
        this.category1List = res.data
      }
    },
    // 一级分类选中以后获取二级分类
    async getCategory2List() {
      // 清空所有二三级分类数据
      this.category2List = []
      this.category3List = []
      this.selectCategoryForm.category2Id = ''
      this.selectCategoryForm.category3Id = ''
      // 获取一级分类
      const { category1Id } = this.selectCategoryForm
      const res = await this.$api.category.getCategorys2(category1Id)
      if (res.code !== 200) {
        this.$message.error('获取数据失败，请刷新页面重试!')
      } else {
        this.category2List = res.data
      }
      // 将一级分类传给父组件
      this.$emit('changeCategory', { categoryId: category1Id, level: 1 })
    },
    // 二级分类选中时获取三级分类
    async getCategory3List() {
      // 清空三级分类数据
      this.category3List = []
      this.selectCategoryForm.category3Id = ''
      // 获取三级分类
      const { category2Id } = this.selectCategoryForm
      const res = await this.$api.category.getCategorys3(category2Id)
      if (res.code !== 200) {
        this.$message.error('获取数据失败，请刷新页面重试!')
      } else {
        this.category3List = res.data
      }
      // 将二级分类传给父组件
      this.$emit('changeCategory', { categoryId: category2Id, level: 2 })
    },
    // 传递数据到父组件
    changeCategory3(category3Id) {
      this.$emit('changeCategory', { categoryId: category3Id, level: 3 })
    }
  }
}
</script>
