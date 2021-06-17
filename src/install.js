import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  // 在install方法上定义installed静态属性，防止重复注册同一个插件
  // 其中Vue为使用Vue,use注册插件时，给install方法传入的vue实例
  if (install.installed && _Vue === Vue) return
  install.installed = true

  // 保存Vue到_Vue，这而_Vue又被导出了，这样其他地方就能接收_Vue并且使用
  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  // 把beforeCreate和destoryed钩子函数注入到每一个组件中去
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        // 保存当前this
        this._routerRoot = this
        // this.$options.router：即 new VueRouter({...})
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
  // 全局注册 router-view 组件
  Vue.component('RouterView', View)
  // 全局注册 router-link 组件
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
