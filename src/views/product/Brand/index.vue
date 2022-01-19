<!-- 品牌管理 -->
<template>
  <div>
    <el-button type="primary" icon="el-icon-edit" @click="showDialog">添加</el-button>
    <!-- table -->
    <el-table :data="barndList" style="width: 100%; margin: 20px 0" border>
      <el-table-column prop="date" label="序号" width="100" type="index" />
      <el-table-column prop="tmName" label="品牌名称" align="center" />
      <el-table-column prop="name" label="品牌LOGO" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" style="width: 80px; height: 60px">
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作" align="center">
        <template slot-scope="{row}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showBrandInfo(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-edit"
            size="mini"
            @click="deleteBrand(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!-- :current-page="currentPage4"-->
    <el-row>
      <el-pagination
        style="text-align: center"
        :page-sizes="[3, 5, 7]"
        layout="prev, pager, next, jumper, -> ,sizes, total"
        :total="total"
        :current-page="page"
        @size-change="handleSizeChange"
        @current-change="getBrandList"
      />
    </el-row>
    <!-- 添加和编辑的对话框 -->
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form ref="brandRuleFrom" :model="tmForm" style="width: 80%" :rules="rules">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10m</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addOrUpdateBrand"
        >确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Brand',
  data() {
    return {
      limit: 3,
      page: 1,
      barndList: [],
      total: 0,
      dialogFormVisible: false,
      tmForm: {
        tmName: '',
        logoUrl: ''
      },
      rules: {
        tmName: [
          { required: true, message: '请填写品牌名称', trigger: 'blur' },
          { min: 2, max: 10, message: '品牌名称应该控制在 2 到 10 个字符', trigger: 'change' }
        ],
        logoUrl: [
          { required: true, message: '请上传品牌 Logo', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.getBrandList()
  },
  methods: {
    // 获取分页品牌信息
    async getBrandList(page = 1) {
      this.page = page
      const res = await this.$api.brand.getBrandList(this.page, this.limit)
      if (res.code === 200) {
        this.barndList = res.data.records
        this.total = res.data.total
      }
    },
    // 每页个数改变的回调函数
    handleSizeChange(limit) {
      this.limit = limit
      this.getBrandList()
    },
    // 上传成功
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.tmForm.logoUrl = res.data
      }
    },
    // 上传之前的回调
    beforeAvatarUpload(file) {
      const imgTypeArr = ['image/jpeg', 'image/png']
      const isJPG = imgTypeArr.indexOf(file.type) !== -1
      const isLt2M = file.size / 1024 / 1024 < 10

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 10MB!')
      }
      return isJPG && isLt2M
    },
    // 显示添加或者修改的对话框
    showDialog() {
      this.dialogFormVisible = true
      this.tmForm = {
        id: null,
        tmName: '',
        logoUrl: ''
      }
    },
    // 编辑按钮
    showBrandInfo(row) {
      this.dialogFormVisible = true
      // 浅拷贝数据，避免双向数据代理的bug
      this.tmForm = { ...row }
    },
    // 添加或者修改品牌
    addOrUpdateBrand() {
      // 先做表单验证
      this.$refs.brandRuleFrom.validate(async valid => {
        if (!valid) return
        const id = this.tmForm.id
        if (!id) {
          // 添加品牌信息
          const res = await this.$api.brand.addBrand(this.tmForm)
          if (res.code === 200) {
            this.$message.success('添加成功！')
            this.getBrandList() // 添加成功跳回第一页
          } else {
            this.$message.error('添加失败，请稍后重试！')
          }
        } else {
          // 修改品牌信息
          const res = await this.$api.brand.updateBrand(this.tmForm)
          if (res.code === 200) {
            this.$message.success('修改成功！')
            this.getBrandList(this.page)
          } else {
            this.$message.error('修改失败，请稍后重试！')
          }
        }
      })
      this.dialogFormVisible = false
    },
    // 删除品牌
    deleteBrand(row) {
      const { tmName, id } = row
      this.$confirm(`确定删除${tmName}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await this.$api.brand.deleteBrandById(id)
        if (res.code === 200) {
          this.$message.success('删除成功！')
          this.getBrandList(this.barndList.length > 1 ? this.page : this.page - 1)
        }
      }).catch(() => {
        this.$message.warning('删除取消')
      })
    }
  }
}
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
