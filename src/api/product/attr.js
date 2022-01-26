import request from '@/utils/request'

const api_name = '/admin/product'

export default {
  // 根据指定分类获取属性列表
  getAttrList: (category1Id, category2Id, category3Id) => request.get(`${api_name}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`),

  // 获取指定属性id的所偶遇属性列表
  getValueList: (attrId) => request.get(`${api_name}/getAttrValueList/${attrId}`),
  // 添加和更新属性
  saveOrUpdateAttr: (attrInfo) => request.post(`${api_name}/saveAttrInfo`, attrInfo),
  // 根据ids删除指定属性
  removeAttr: (id) => request.delete(`${api_name}/deleteAttr/${id}`)
}
