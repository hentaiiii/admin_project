import request from '@/utils/request'

export default {
  // 获取所有属性的spu销售属性列表
  getSaleAttrList: () => request.get('/admin/product/baseSaleAttrList'),

  // 删除指定的spu
  removeSpuById: (spuId) => request.delete(`/admin/product/deleteSpu/${spuId}`),

  // 根据id获取spu详情
  getSpuInfoById: (spuId) => request.get(`/admin/product/getSpuById/${spuId}`),

  // 添加spu详情信息
  addUpdateSpuInfo: (spuInfo) => {
    return request({
      url: `/admin/product/${spuInfo.id ? 'update' : 'save'}SpuInfo`,
      method: 'POST',
      data: spuInfo
    })
  },

  // 根据三级分类id获取spu商品分类信息
  getList: (page, limit, category3Id) => {
    return request({
      url: `/admin/product/${page}/${limit}`,
      method: 'GET',
      params: { category3Id }
    })
  },

  // 根据关键字获取spu信息
  findSpuInfoByKeyword: (keyword) => request.get(`/admin/product/findSpuInfoByKeyword/${keyword}`)
}
