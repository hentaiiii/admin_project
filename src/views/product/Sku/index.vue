<!-- sku管理 -->
<template>
  <div>
    <el-card class="sku-list">
      <el-table :data="allSkuList" style="width: 100%;margin:10px 0" border>
        <el-table-column type="index" label="序号" align="center" width="100" />
        <el-table-column prop="skuName" label="名称" />
        <el-table-column prop="skuDesc" label="描述" />
        <el-table-column prop="date" label="默认图片" width="150">
          <template slot-scope="{row}">
            <img :src="row.skuDefaultImg" style="width:100px;height:100px" alt="商品图片">
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)" />
        <el-table-column prop="price" label="价格(元)" width="100" />
        <el-table-column prop="date" label="操作">
          <template slot-scope="{row}">
            <HintButton v-if="row.isSale == 0" icon="el-icon-top" title="上架" type="info" size="mini" @click="onSale(row.id)" />
            <HintButton v-else icon="el-icon-bottom" title="下架" type="success" size="mini" @click="cancelSale(row.id)" />
            <HintButton icon="el-icon-edit" title="修改" type="warning" size="mini" @click="$message.info('正在开发中')" />
            <HintButton icon="el-icon-info" title="查看详情" type="info" size="mini" @click="showDrawer(row)" />
            <el-popconfirm
              :title="`确定删除${row.skuName}吗？`"
              @onConfirm="deleteSku(row.id)"
            >
              <HintButton slot="reference" icon="el-icon-delete" title="删除" type="danger" size="mini" />
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        :current-page="page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="limit"
        layout="prev, pager, next, jumper,->,sizes,total"
        :total="total"
        style="text-align: center"
        @size-change="handleSizeChange"
        @current-change="getAllSkuList"
      />
      <!-- 抽屉 -->
      <el-drawer
        :with-header="false"
        :visible.sync="drawer"
        :direction="direction"
        :before-close="handleClose"
        size="50%"
      >
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="16">{{ skuInfo.skuName }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="16">{{ skuInfo.price }} 元</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="18">
            <el-tag v-for="value in skuInfo.skuAttrValueList" :key="value.id" type="success" style="margin-right: 5px">
              {{ value.attrId + '-' + value.valueId }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="16">
            <el-carousel class="sku-carousel" trigger="click" height="400px">
              <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
                <img :src="item.imgUrl" alt="">
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SKU',
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      allSkuList: [],
      isLoading: false,
      isCancel: true,
      drawer: false, // 控制抽屉的显示和隐藏
      direction: 'rtl', // 控制抽屉的方向
      skuInfo: ''
    }
  },
  mounted() {
    this.getAllSkuList()
  },
  methods: {
    // 获取所有的sku列表
    async getAllSkuList(pager = 1) {
      this.page = pager
      const { page, limit } = this
      this.isLoading = true
      try {
        const res = await this.$api.sku.getSkuList(page, limit)
        this.allSkuList = res.data.records
        this.total = res.data.total
      } catch (error) {
        this.$message.error('获取数据失败,请稍后重试!')
      }
      this.isLoading = false
    },
    // 每页改变的回调函数
    handleSizeChange(limit) {
      this.limit = limit
      this.getAllSkuList()
    },
    // sku商品下架
    async cancelSale(id) {
      try {
        await this.$api.sku.cancelSale(id)
        this.$message.success('下架成功')
        this.getAllSkuList()
      } catch (error) {
        this.$message.error('操作失败!')
      }
    },
    // sku商品上架
    async onSale(id) {
      try {
        await this.$api.sku.onSale(id)
        this.$message.success('上架成功')
        this.getAllSkuList()
      } catch (error) {
        this.$message.error('操作失败!')
      }
    },
    // 关闭抽屉的回调函数
    handleClose() {
      this.drawer = false
      this.skuInfo = {}
    },
    // 显示抽屉
    async showDrawer(row) {
      const res = await this.$api.sku.getSkuInfo(row.id)
      this.skuInfo = res.data
      this.drawer = true
    },
    // 删除单个sku
    async deleteSku(id) {
      try {
        await this.$api.sku.removeSkuById(id)
        this.$message.success('删除成功')
        this.getAllSkuList()
      } catch (error) {
        this.$message.error('删除失败')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  /*
    1. 为什么必须加 /deep/ 或者 ::v-deep 才能修改Carousel组件的样式?, 
      声明了scoped, 不用deep不能修改子组件的非标签样式(也就是Carousel组件内部的子标签样式)
      用了deep: 不会对目标标签有当前组件的data属性选择的要求
    2. 为什么不加/deep/能修改Row/Col组件的样式?
      我们修改的是Row/Col根标签样式(它有当前组件的data属性)
  */
  .sku-list {
    .el-row {
      height: 40px;
      .el-col {
        line-height: 40px;
        &.el-col-5 {
          font-size: 18px;
          font-weight: bold;
          text-align: right;
          margin-right: 20px;
        }
      }
    }

    .sku-carousel {
      width: 400px;
      border: 1px solid #ccc;
      img {
        width: 400px;
        height: 400px;
      }
      ::v-deep .el-carousel__indicator {
        button {
          background-color: hotpink;
        }
        &.is-active {
          button {
            background-color: green;
          }
        }
      }
    }
  }
</style>
