import request from '@/utils/request'

export default {
  // 获取一级分类
  getCategorys1: () => request.get('/admin/product/getCategory1'),
  // 根据一级分类获取二级分类
  getCategorys2: (category1Id) => request.get('/admin/product/getCategory2/' + category1Id),
  // 根据二级分类获取三级分类
  getCategorys3: (category2Id) => request.get('/admin/product/getCategory3/' + category2Id)
}
