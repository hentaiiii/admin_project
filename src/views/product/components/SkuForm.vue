<!-- SpuuForm -->
<template>
  <div>
    <el-form :model="skuForm" label-width="100px">
      <el-form-item label="SPU 名称">
        {{ spu.spuName }}
      </el-form-item>
      <el-form-item label="SKU 名称">
        <el-input v-model="skuForm.skuName" placeholder="SKU 名称" />
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input v-model="skuForm.price" placeholder="SKU 价格" />
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input v-model="skuForm.weight" placeholder="SKU 重量" />
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          v-model="skuForm.skuDesc"
          placeholder="SKU 描述规格"
          type="textarea"
          rows="4"
        />
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form inline label-width="100px">
          <el-form-item
            v-for="attr in skuAttrValueList"
            :key="attr.id"
            style="margin: 5px 0"
            :label="attr.attrName"
          >
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option
                v-for="item in attr.attrValueList"
                :key="item.id"
                :label="item.valueName"
                :value="`${attr.id}:${item.id}`"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form inline label-width="100px">
          <el-form-item
            v-for="saleAttr in skuSaleAttrValueList"
            :key="saleAttr.id"
            :label="saleAttr.saleAttrName"
          >
            <el-select v-model="saleAttr.saleAttrValueId" placeholder="请选择">
              <el-option
                v-for="item in saleAttr.spuSaleAttrValueList"
                :key="item.id"
                :label="item.saleAttrValueName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          :data="skuImageList"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="图片">
            <template slot-scope="{ row }">
              <img :src="row.imgUrl" style="width: 100px; height: 100px">
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName" />
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                size="mini"
                @click="setDefault(row)"
              >设为默认</el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SkuForm',
  data() {
    return {
      skuForm: {
        // 父组件传递的数据
        category3Id: '',
        tmId: '',
        spuId: '',
        // vmodel直接收集
        price: '',
        weight: '',
        skuName: '',
        skuDesc: '',
        // 通过代码收集
        skuDefaultImg: '',
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: []
      },
      spu: {}, // 父组件传递过来的spu信息
      skuAttrValueList: [], // sku平台属性列表
      skuImageList: [], // 图片列表
      skuSaleAttrValueList: [], // sku销售属性列表
      selectedSpuImageList: [] // 以选择的图片
    }
  },
  methods: {
    // 初始化数据
    async initLoadAddSkuData(spu, category2Id, category1Id) {
      this.spu = spu
      // http://localhost:9528/dev-api/admin/product/attrInfoList/2/13/61 根据指定分类获取属性列表
      const promise1 = this.$api.attr.getAttrList(
        category1Id,
        category2Id,
        spu.category3Id
      )
      // http://localhost:9528/dev-api/admin/product/spuSaleAttrList/4  获取指定SPU的id对应的销售属性列表
      const promise2 = this.$api.sku.getSpuSaleAttrList(spu.id)
      // http://localhost:9528/dev-api/admin/product/spuImageList/4 获取指定SPU的id对应的图片列表
      const promise3 = this.$api.sku.getSpuImageList(spu.id)
      const result = await Promise.all([promise1, promise2, promise3])
      this.skuAttrValueList = result[0].data
      this.skuSaleAttrValueList = result[1].data
      // this.skuImageList = result[2].data
      let skuImageList = result[2].data
      skuImageList = skuImageList.map(item => {
        item.isDefault = '0'
        return item
      })
      this.skuImageList = skuImageList
    },
    // 图片的收集
    handleSelectionChange(val) {
      this.selectedSpuImageList = val
    },
    // 设置默认图片
    setDefault(row) {
      this.skuImageList.forEach(item => {
        item.isDefault = '0'
      })
      row.isDefault = '1'
      // 收集数据
      this.skuForm.skuDefaultImg = row.imgUrl
    },
    // 图片的收集
    async save() {
      const { skuForm, spu, skuAttrValueList, skuSaleAttrValueList, selectedSpuImageList } = this
      // 收集父组件传递过来的属性
      skuForm.category3Id = spu.category3Id
      skuForm.tmId = spu.tmId
      skuForm.spuId = spu.id
      // 收集图片列表
      skuForm.skuImageList = selectedSpuImageList.map(item => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          spuImgId: item.id,
          isDefault: item.isDefault
        }
      })
      // 收集平台属性
      skuForm.skuAttrValueList = skuAttrValueList.reduce((pre, attr) => {
        if (attr.attrIdValueId) {
          const [attrId, valueId] = attr.attrIdValueId.split(':')
          pre.push({
            attrId,
            valueId
          })
        }
        return pre
      }, [])
      // 收集销售属性
      skuForm.skuSaleAttrValueList = skuSaleAttrValueList.reduce((pre, attr) => {
        if (attr.saleAttrValueId) {
          pre.push({ saleAttrValueId: attr.saleAttrValueId })
        }
        return pre
      }, [])
      // 收集完成 发送请求
      const res = await this.$api.sku.addUpdateSku(skuForm)
      if (res.code === 200) {
        this.$message.success('添加成功!')
        this.$emit('update:visible', false) // 返回列表页
        this.resetData()
        // 父组件不需要任何操作, 因为返回了以后本来就看不见sku列表,需要再点击按钮才能看见
      } else {
        this.$message.error('添加失败!')
      }
    },
    // 初始化数据
    resetData() {
      this.skuForm = {
        category3Id: '',
        tmId: '',
        spuId: '',
        price: '',
        weight: '',
        skuName: '',
        skuDesc: '',
        skuDefaultImg: '',
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: []
      }
      this.spu = {} // 父组件传递过来的spu信息
      this.skuAttrValueList = [] // sku平台属性列表
      this.skuImageList = [] // 图片列表
      this.skuSaleAttrValueList = [] // sku销售属性列表
      this.selectedSpuImageList = [] // 以选择的图片
    },
    // 取消添加sku
    cancel() {
      this.$emit('update:visible', false)
      this.resetData()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
