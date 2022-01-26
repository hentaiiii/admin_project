<!-- SpuuForm -->
<template>
  <div>
    <el-form ref="form" :model="spuForm" label-width="100px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName" placeholder="spu名称" />
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option
            v-for="tm in trademarkList"
            :key="tm.id"
            :label="tm.tmName"
            :value="tm.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          v-model="spuForm.description"
          placeholder="spu描述"
          type="textarea"
          rows="4"
        />
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          :file-list="spuImageList"
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img :src="dialogImageUrl" alt="spuImage.tmName">
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select v-model="attrIdAttrName" :placeholder="unUsedSaleAttrList.length === 0? '没有啦': `还有${unUsedSaleAttrList.length}项未选择`">
          <el-option v-for="saleAttr in unUsedSaleAttrList" :key="saleAttr.id" :value="saleAttr.id + ':'+ saleAttr.name" :label="saleAttr.name" />
        </el-select>
        <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAttrName" @click="addSpuSaleAttr">添加销售属性</el-button>

        <el-table :data="spuForm.spuSaleAttrList" style="width: 100%;margin: 20px 0;" border>
          <el-table-column type="index" label="序号" width="100" align="cneter" />
          <el-table-column label="属性名" width="150" prop="saleAttrName" />
          <el-table-column label="属性值名称列表">
            <template slot-scope="{row, $index}">
              <el-tag
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ spuSaleAttrValue.saleAttrValueName }}
              </el-tag>
              <el-input
                v-if="row.edit"
                :ref="$index"
                v-model.trim="row.saleAttrValueName"
                class="input-new-tag"
                size="small"
                @keyup.enter.native="addSpuSaleAttrValue(row, $index)"
                @blur="addSpuSaleAttrValue(row, $index)"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row, $index)">+ 添加</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index}">
              <HintButton title="删除" type="danger" icon="el-icon-delete" size="mini" @click="spuForm.spuSaleAttrList.splice($index, 1)" />
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="concelAddOrUpdate">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SpuForm',
  data() {
    return {
      spuId: '', // 当前得spuID
      spuForm: {
        category3Id: null, // 3级分类ID
        spuName: '', // spu名称
        description: '', // spu描述
        tmId: null, // spu的品牌id
        spuSaleAttrList: [], // spu的销售属性列表
        spuImageList: [] // spu图片列表
      },
      dialogVisible: false, // 标识大图是否显示
      dialogImageUrl: '', // 展示大图得url

      saleAttrList: [], // 销售属性列表
      trademarkList: [], // 品牌列表
      spuImageList: [], // spu图片展示列表
      attrIdAttrName: '', // 用来收集销售属性的id和name
      category3Id: ''
    }
  },
  computed: {
    // 剩余的销售属性
    unUsedSaleAttrList() {
      const { saleAttrList } = this
      const { spuSaleAttrList } = this.spuForm
      return saleAttrList.filter(saleAttr => !spuSaleAttrList.some(item => item.saleAttrName === saleAttr.name))
    }
  },
  methods: {
    // 点击删除图片得回调函数
    handleRemove(file, fileList) {
      this.spuImageList = fileList
    },
    // 显示指定得大图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 上传图片成功得回调函数
    handleUploadSuccess(response, file, fileList) {
      console.log(file)
      if (response.code === 200) {
        this.spuImageList = fileList
      } else {
        this.$$message.error('上传失败!')
      }
    },
    // 请求加载更新页面所需要得初始化数据
    initLoadUpdateData(id) {
      this.spuId = id
      this.getBrandList() // 所有品牌列表
      this.getSaleAttrList() // 所有销售属性列表
      this.getSpuImageList() // 获取展示图片列表
      this.getSpuInfo() // 获取商品详情信息
    },
    initLoadAddDate(category3Id) {
      this.category3Id = category3Id
      this.spuForm.category3Id = category3Id
      this.getBrandList()
      this.getSaleAttrList()
    },
    // 取消添加或者修改spu返回主页面
    concelAddOrUpdate() {
      this.$emit('update:visible', false)
      // 重置数据
      this.resetData()
      // 通知父组件取消(就是清除添加和修改的标识)
      this.$emit('cancel')
    },
    // 获取所有得品牌列表
    async getBrandList() {
      const res = await this.$api.brand.getBrandList()
      if (res.code === 200) {
        this.trademarkList = res.data
      }
    },
    // 获取所有spu销售属性
    async getSaleAttrList() {
      const res = await this.$api.spu.getSaleAttrList()
      if (res.code === 200) {
        this.saleAttrList = res.data
      }
    },
    // 根据spuid获取展示图片列表
    async getSpuImageList() {
      const res = await this.$api.sku.getSpuImageList(this.spuId)
      if (res.code === 200) {
        const spuImageList = res.data
        // 添加url属性和name属性展示数据
        spuImageList.forEach(item => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        this.spuImageList = spuImageList
      }
    },
    // 根据spuid获取spuinfo
    async getSpuInfo() {
      const res = await this.$api.spu.getSpuInfoById(this.spuId)
      if (res.code === 200) {
        this.spuForm = res.data
      }
    },
    // enter或者失去焦点退出编辑模式
    addSpuSaleAttrValue(row, index) { // 为什么会触发两次
      const { saleAttrValueName, baseSaleAttrId } = row
      if (!saleAttrValueName) {
        row.edit = false
        return
      }
      // 不能有相同的属性值
      const isRepeat = row.spuSaleAttrValueList.some(item => {
        return item.saleAttrValueName + '' === saleAttrValueName + ''
      })
      if (isRepeat) {
        this.$message.info('不能输入重复的属性值')
        this.$nextTick(() => this.$refs[index].focus())
        return
      }
      // 添加新的对象
      row.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      })
      row.edit = false
      row.saleAttrValueName = ''
    },
    // 点击按钮进入编辑模式
    showInput(spuSaleAttr, index) {
      if (Object.prototype.hasOwnProperty.call(spuSaleAttr, 'edit')) {
        spuSaleAttr.edit = true
      } else {
        this.$set(spuSaleAttr, 'edit', true)
      }
      // 自动获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus()
      })
    },
    // 添加销售属性
    addSpuSaleAttr() {
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(':')
      // 创建一个spu销售属性对象
      const spuSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      }
      this.spuForm.spuSaleAttrList.push(spuSaleAttr)
      this.attrIdAttrName = ''
    },
    // 保存spu
    async save() {
      // 收集数据
      const { spuImageList, spuForm } = this
      spuForm.spuImageList = spuImageList.map(item => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data
        }
      })
      // 清空添加的属性
      spuForm.spuSaleAttrList = spuForm.spuSaleAttrList.filter(item => {
        delete item.edit
        delete item.saleAttrValueName
        return item.spuSaleAttrValueList.length > 0
      })
      // 发送ajax请求
      try {
        console.log(spuForm)
        await this.$api.spu.addUpdateSpuInfo(spuForm)
        this.$message.success('保存成功!')
        this.$emit('update:visible', false) // 返回列表页
        this.$emit('success') // 父组件进行刷新页面等操作
        this.resetData() // 重置数据
      } catch (error) {
        this.$message.error('保存失败!')
      }
    },
    // 重置数据
    resetData() {
      this.spuId = ''
      this.spuForm = {
        category3Id: null,
        spuName: '',
        description: '',
        tmId: null,
        spuSaleAttrList: [],
        spuImageList: []
      }
      this.dialogVisible = false
      this.dialogImageUrl = ''
      this.saleAttrList = []
      this.trademarkList = []
      this.spuImageList = []
      this.attrIdAttrName = ''
      this.category3Id = ''
    }
  }
}
</script>
<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
