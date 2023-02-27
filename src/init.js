import { initState } from "./state";
import { compileToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { callHook, mergeOptions } from "./utils";


export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this; //保留一下this

    //我们使用vue的时候  $nextTick   $data等等   表明是实例的变量
    vm.$options = mergeOptions(this.constructor.options, options);

    //初始化状态
    callHook(vm, "beforeCreate");   //钩子函数
    initState(vm);   //初始化状态
    callHook(vm, "created");

    if (options.el) {
      vm.$mount(options.el);
    }
 
  };//挂载$mount方法到原型上
  Vue.prototype.$mount = function (el) {
    const vm = this;
    if(el){
      el = document.querySelector(el);
    }
    let ops = vm.$options;

    if (!ops.render) {
      //查看用户有没有写render函数
      let template;
      if (!ops.template && el) {
        //没有模板  但是有el  template就直接为el
        template = el.outerHTML;
      } else {
        if (ops.template) {
          //有模板  就直接用模板
          template = ops.template;
        }
      }
      //有了模板之后  对模板进行编译
      if (template) {
        const render = compileToFunction(template); //对模板进行编译  得到render函数
        ops.render = render; //将render函数绑定到ops上
      }
    }
    
    mountComponent(vm, el); // 挂载组件
  };
}
