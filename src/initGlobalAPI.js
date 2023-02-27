import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
  //实现核心功能mixin
  Vue.options = {
    _base:Vue
  };
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };

  //实现extend方法  返回一个子类的构造方法
  Vue.extend = function (options) {
    function Sub(options = {}) {
      this._init(options);
    }                               //面向切片编程  AOP
    Sub.prototype = Object.create(Vue.prototype); //将sub的原型对象变为Vue的prototype
    Sub.prototype.constructor = Sub;   //再将原型对象的构造函数变为Sub
    Sub.options = mergeOptions(Vue.options,options); //需要将用户传入的options与全局options进行合并
    return Sub;
  };

  Vue.options.components = {}   //维护一个全局的components
  Vue.component =function(name,definition){   //实现component功能
    definition = typeof definition == "function"?definition:Vue.extend(definition)
    Vue.options.components[name] = definition
  }
}


