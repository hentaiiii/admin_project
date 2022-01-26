import request from '@/utils/request'

export default {
  // 下架sku
  cancelSale: (skuId) => request.get(`/admin/product/cancelSale/${skuId}`),

  // 上架sku
  onSale: (skuId) => request.get(`/admin/product/onSale/${skuId}`),

  // 根据id删除指定的sku
  removeSkuById: (skuId) => request.delete(`/admin/product/deleteSku/${skuId}`),

  // 根据指定的spu id查询所有对应的sku的列表
  getSkuListBySpuId: (spuId) => request.get(`/admin/product/findBySpuId/${spuId}`),

  // 根据sku id 查询sku详细信息
  getSkuInfo: (skuId) => request.get(`/admin/product/getSkuById/${skuId}`),

  // 获取sku的分页列表
  getSkuList: (page, limit) => request.get(`/admin/product/list/${page}/${limit}`),

  // 保存或者更修sku
  addUpdateSku: (skuInfo) => request.post(`/admin/product/${skuInfo.id ? 'update' : 'save'}SkuInfo`, skuInfo),

  // 获取指定SPU的id对应的图片列表
  getSpuImageList: (spuId) => request.get(`/admin/product/spuImageList/${spuId}`),

  // 获取指定SPU的id对应的销售属性列表
  getSpuSaleAttrList: (spuId) => request.get(`/admin/product/spuSaleAttrList/${spuId}`)
}
