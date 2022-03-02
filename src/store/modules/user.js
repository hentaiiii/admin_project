import { login, logout, getInfo } from '@/api/acl/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter, asyncRoutes, constantRoutes, anyRoutes } from '@/router'
import router from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    buttons: [],
    roles: [],
    routes: [],
    // 匹配后的异步路由
    resultAsyncRoute: [],
    // 角色所有路由
    resultAllRoutes: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
  // 存储用户信息
  SET_USERINFO(state, userInfo) {
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    // 存储权限标记
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
    state.routes = userInfo.routes
    // 存储匹配后的异步路由
    state.resultAsyncRoute = getResultAsyncRoutes(asyncRoutes, userInfo.routes)
    state.resultAllRoutes = constantRoutes.concat(state.resultAsyncRoute, anyRoutes)
    router.addRoutes(state.resultAllRoutes)
  }
}

const actions = {
  // 用户登录的action
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登录后获取用户细腻些
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        console.log(data)
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        commit('SET_USERINFO', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户退出登录
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}
// 筛选角色匹配路由的工具函数
function getResultAsyncRoutes(asyncRoutes, routes) {
  // 由于element源码的修改 tree组件只要添加就会带上它的父组件的id值 所以这里肯定会获取一整套的路由
  return asyncRoutes.filter(item => {
    if (routes.indexOf(item.name) !== -1) {
      if (item.children && item.children.length) {
        getResultAsyncRoutes(item.children, routes)
      }
      return true
    }
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

