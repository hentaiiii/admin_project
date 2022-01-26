<!-- 平台属性管理 -->
<template>
  <div>
    <el-card>
      <CategorySelector :is-show-add-div="isShowAddDiv" @changeCategory="changeCategory" />
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="!isShowAddDiv">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="showAddAttrPage">添加属性</el-button>
        <el-row>
          <el-table
            :data="attrInfoList"
            highlight-current-row
            style="width: 100%; margin-top: 20px"
            border
          >
            <el-table-column
              type="index"
              width="100"
              label="序号"
              align="center"
            />
            <el-table-column
              property="date"
              label="属性名称"
              prop="attrName"
              width="150"
            />
            <el-table-column property="name" label="属性列表">
              <template slot-scope="{ row }">
                <el-tag
                  v-for="attr in row.attrValueList"
                  :key="attr.id"
                  type="info"
                >
                  {{ attr.valueName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column property="address" label="操作" width="150px">
              <template slot-scope="{ row }">
                <HintButton
                  title="编辑"
                  icon="el-icon-edit"
                  size="mini"
                  type="warning"
                  @click="showUpdateAttrPage(row)"
                />
                <el-popconfirm :title="`确定删除${row.attrName}吗?`" style="marginLeft: 10px" @onConfirm="deleteAttr(row.id)">
                  <HintButton
                    slot="reference"
                    title="删除"
                    icon="el-icon-delete"
                    size="mini"
                    type="danger"
                  />
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </div>
      <!-- 添加属性页面 -->
      <div v-show="isShowAddDiv">
        <el-form :inline="true" :model="editForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="editForm.attrName" placeholder="请输入属性名" />
          </el-form-item>
        </el-form>
        <el-row>
          <el-button icon="el-icon-plus" type="primary" :disabled="!editForm.attrName.trim()" @click="addAttrValue">添加属性值</el-button>
          <el-button @click="isShowAddDiv = false">取消</el-button>
        </el-row>
        <el-table :data="editForm.attrValueList" style="width: 100%;margin: 20px 0" border>
          <el-table-column type="index" label="序号" width="100" align="center" />
          <el-table-column prop="name" label="属性名称">
            <template slot-scope="{row, $index}">
              <el-input v-if="row.edit" :ref="$index" v-model="row.valueName" size="mini" @blur="toList(row)" @keyup.enter.native="toList(row)" />
              <span v-else style="display: block;width:100%;height:100;" @click="changeEdit(row, $index)">{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作">
            <template slot-scope="{row, $index}">
              <el-popconfirm :title="`确定删除${row.valueName}吗`" @onConfirm="editForm.attrValueList.splice($index, 1)">
                <HintButton slot="reference" icon="el-icon-delete" title="删除" type="danger" size="mini" />
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-row>
          <el-button type="primary" :disabled="editForm.attrValueList.length === 0" @click="saveOrUpdateAttr">保存</el-button>
          <el-button @click="isShowAddDiv = false">取消</el-button>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Attr',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      attrInfoList: [],
      isShowAddDiv: false, // 添加页的显示和隐藏
      editForm: { // 添加或者修改收集的数据
        attrName: '',
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 0
      }
    }
  },
  methods: {
    // 接收子组件传递过来的id
    async changeCategory(categoryObj) {
      const { categoryId, level } = categoryObj
      if (level === 1) {
        this.category1Id = categoryId
        // 清空二三级
        this.attrInfoList = []
        this.category2Id = ''
        this.category3Id = ''
      } else if (level === 2) {
        this.category2Id = categoryId
        // 清空三级
        this.category3Id = ''
        this.attrInfoList = []
      } else {
        this.category3Id = categoryId
        // 当三级id被选中的时候发送请求获取数据
        this.getAttrs()
      }
    },
    // 显示添加属性页面
    showAddAttrPage() {
      // 收集数据
      this.editForm.attrName = ''
      this.editForm.attrValueList = []
      this.editForm.categoryId = this.category3Id
      this.editForm.categoryLevel = 3

      this.isShowAddDiv = true
    },
    // 添加属性值
    addAttrValue() {
      this.editForm.attrValueList.push(
        { attrId: null, valueName: '', edit: true }
      )
      // 添加属性值时自动获取焦点
      this.$nextTick(() => {
        this.$refs[this.editForm.attrValueList.length - 1].focus()
      })
    },
    // 改变编辑状态
    toList(row) {
      // 检验数据  1.数据不为空 2.数据不相同
      const { valueName } = row
      if (valueName) {
        const isSame = this.editForm.attrValueList.some(item => {
          // 判断自身不会相等
          if (item !== row) {
            return item.valueName === valueName
          }
        })
        if (!isSame) {
          row.edit = false
        } else {
          this.$message.info('不能输入相同的属性值!')
        }
      } else {
        this.$message.info('请输入属性值!')
      }
    },
    // 显示修改属性页面
    showUpdateAttrPage(row) {
      // 深拷贝
      this.editForm = cloneDeep(row)
      // 使用set添加响应式属性
      this.editForm.attrValueList.forEach(item => {
        this.$set(item, 'edit', false)
      })
      this.isShowAddDiv = true
    },
    // 点击span改变编辑状态
    changeEdit(row, index) {
      row.edit = true
      // 自动获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus()
      })
    },
    // 保存或者修改属性
    async saveOrUpdateAttr() {
      // 校验数据
      const { editForm } = this
      if (editForm.attrName) {
        editForm.attrValueList = editForm.attrValueList.filter(item => {
          if (item.valueName) {
            delete item.edit
            return true
          }
          return false
        })
        if (editForm.attrValueList.length === 0) {
          this.$message.info('至少指定一个属性值名称!')
          return
        }
        try {
          // 请求成功
          await this.$api.attr.saveOrUpdateAttr(editForm)
          this.$message.success('保存成功!')
          this.isShowAddDiv = false
          // 刷新页面
          this.getAttrs()
        } catch (error) {
          this.$message.error('保存属性失败')
        }
      } else {
        this.$message.info('请输入属性名称!')
      }
    },
    // 获取属性列表
    async getAttrs() {
      const { category1Id, category2Id, category3Id } = this
      // 获取属性列表
      const res = await this.$api.attr.getAttrList(
        category1Id,
        category2Id,
        category3Id
      )
      if (res.code === 200) {
        this.attrInfoList = res.data
      }
    },
    // 删除属性
    async deleteAttr(id) {
      try {
        await this.$api.attr.removeAttr(id)
        this.$message.success('删除成功!')
        this.getAttrs()
      } catch (error) {
        this.$message.error('删除失败!')
      }
    }
  }
}
</script>
