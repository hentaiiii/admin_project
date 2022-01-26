<!-- spu管理 -->
<template>
  <div>
    <el-card>
      <CategorySelector
        :is-show-add-div="isShowAddDiv"
        @changeCategory="changeCategory"
      />
    </el-card>
    <el-card v-show="!showSpuForm && !showSkuForm" style="margin: 20px 0">
      <el-button icon="el-icon-plus" type="primary" :disabled="!category3Id" @click="showAddSpuForm">添加SPU</el-button>
      <el-table :data="spuList" border style="width: 100%; margin: 20px 0">
        <el-table-column type="index" label="序号" align="center" width="100" />
        <el-table-column prop="spuName" label="SPU名称" />
        <el-table-column prop="description" label="SPU描述" />
        <el-table-column prop="spuList" label="操作">
          <template slot-scope="{row}">
            <HintButton
              icon="el-icon-plus"
              title="添加SKU"
              type="primary"
              size="mini"
              @click="showAddSkuForm(row)"
            />
            <HintButton
              icon="el-icon-edit"
              title="修改SPU"
              type="warning"
              size="mini"
              @click="showUpdateSpuForm(row)"
            />
            <HintButton
              icon="el-icon-info"
              title="查看SKU列表"
              type="info"
              size="mini"
              @click="showSkuList(row)"
            />
            <el-popconfirm
              :title="`确定删除${row.spuName}吗?`"
              @onConfirm="deleteSpu(row)"
            >
              <HintButton
                slot="reference"
                icon="el-icon-delete"
                title="删除SPU"
                type="danger"
                size="mini"
              />
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        :current-page="page"
        :page-sizes="[2, 3, 5]"
        :page-size="limit"
        layout="prev, pager, next, jumper, ->, sizes, total"
        :total="total"
        style="text-align: center; margin-top: 20px"
        @size-change="handleSizeChange"
        @current-change="getSpuList"
      />
      <!-- 查看sku的对话框 -->
      <el-dialog
        :title="`${spu.spuName} => SKU列表`"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleClose"
      >
        <el-table
          :data="skuList"
          style="width: 100%"
        >
          <el-table-column prop="skuName" label="名称" />
          <el-table-column prop="price" label="价格(元)" />
          <el-table-column prop="weight" label="重量(KG)" />
          <el-table-column label="默认图片">
            <template slot-scope="{row}">
              <img :src="row.skuDefaultImg" style="width:100px;height:100px">
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
    <el-card v-show="showSkuForm" style="margin: 20px 0">
      <SkuForm ref="skuForm" :visible.sync="showSkuForm" />
    </el-card>
    <el-card v-show="showSpuForm" style="margin: 20px 0">
      <SpuForm ref="spuForm" :visible.sync="showSpuForm" @success="success" @cancel="cancel" />
    </el-card>
  </div>
</template>

<script>
import SkuForm from '../components/SkuForm.vue'
import SpuForm from '../components/SpuForm.vue'
export default {
  name: 'SPU',
  components: {
    SkuForm,
    SpuForm
  },
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      page: 1,
      limit: 3,
      total: 0,
      spuList: [],
      showSkuForm: false,
      showSpuForm: false,
      isShowAddDiv: false,
      dialogVisible: false, // 控制查看sku列表的对话框的显示和隐藏
      spu: {},
      skuList: [], // 单个spu下面的sku列表
      isLoading: false // 是否正在加载
    }
  },
  watch: {
    showSpuForm(newVal) {
      this.isShowAddDiv = newVal
    },
    showSkuForm(newVal) {
      this.isShowAddDiv = newVal
    }
  },
  methods: {
    changeCategory(categoryObj) {
      const { categoryId, level } = categoryObj
      if (level === 1) {
        // 清空二三级
        this.category1Id = categoryId
      } else if (level === 2) {
        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        // 根据三级分类id获取spu商品分类信息
        this.getSpuList()
      }
    },
    //  // 根据三级分类id获取spu商品分类信息
    async getSpuList(pager = 1) {
      this.page = pager
      const { page, limit, category3Id } = this
      const res = await this.$api.spu.getList(page, limit, category3Id)
      if (res.code === 200) {
        this.spuList = res.data.records
        this.total = res.data.total
      }
    },
    // 分页器每页页数改变时
    handleSizeChange(size) {
      this.limit = size
      this.getSpuList()
    },
    // 显示添加页面
    showAddSpuForm() {
      this.flag = true
      this.showSpuForm = true
      this.$refs.spuForm.initLoadAddDate(this.category3Id)
    },
    // 显示修改spu页面
    showUpdateSpuForm(row) {
      this.flag = false
      this.showSpuForm = true
      this.$refs.spuForm.initLoadUpdateData(row.id)
    },
    // 显示添加SKU页面
    showAddSkuForm(row) {
      this.showSkuForm = true
      this.$refs.skuForm.initLoadAddSkuData(row, this.category2Id, this.category1Id)
    },
    // 修改spu成功的回调函数
    success() {
      if (this.flag) {
        // 添加spu
        console.log('添加spu')
        this.getSpuList()
      } else {
        // 修改spu
        console.log('修改spu')
        this.getSpuList(this.page)
      }
      this.flag = null
    },
    // 取消添加或者修改
    cancel() {
      this.flag = null
    },
    // 删除单个spu
    async deleteSpu(row) {
      try {
        await this.$api.spu.removeSpuById(row.id)
        this.$message.success('删除成功!')
        this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1)
      } catch (error) {
        this.$message.error('删除失败!')
      }
    },
    // 查看sku
    async showSkuList(row) {
      this.spu = row
      this.dialogVisible = true
      this.skuList = []
      this.isLoading = true
      // 获取一下sku列表
      const res = await this.$api.sku.getSkuListBySpuId(row.id)
      if (res.code === 200) {
        this.skuList = res.data
      } else {
        this.$message.error('获取数据失败!')
      }
      this.isLoading = false
    },
    // 对话框关闭的回调函数
    handleClose() {
      this.dialogVisible = false
      this.skuList = []
      this.spu = {}
    }
  }
}
</script>
