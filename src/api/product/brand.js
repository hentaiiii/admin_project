import request from '@/utils/request'

const api_name = '/admin/product/baseTrademark'
export default {
  // 获取品牌列表
  getBrandList(page, limit) {
    if (page && limit) {
      return request.get(`${api_name}/${page}/${limit}`)
    } else {
      return request.get(`${api_name}/getTrademarkList`)
    }
  },
  // 根据id获取品牌信息
  getBrandById: (id) => request.get(`${api_name}/get/${id}`),

  // 添加品牌
  addBrand: (trademark) => request.post(`${api_name}/save`, trademark),

  // 修改品牌信息
  updateBrand: (trademark) => request.put(`${api_name}/update`, trademark),

  // 根据id删除品牌信息
  deleteBrandById: (id) => request.delete(`${api_name}/remove/${id}`)
}
