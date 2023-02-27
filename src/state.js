import { initComputed } from "./initComputed";
import { initMethods } from "./initMethods";
import { observe } from "./observe/index";
import { nextTick, Watcher } from "./observe/watcher";

export function initState(vm) {
  //初始化
  const opts = vm.$options;
  // if(opts.props){
  //     initProps()
  // }
  if (opts.data) {
    initData(vm); //初始化data属性
  }
  if (opts.computed) {
    //初始化computed属性
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
  if(opts.methods){
    console.log("初始化methods")
    initMethods(vm)
  }
}

//初始化watch
/*
    watch:{
        good(newValue,oldValue){
            xxxx
        }
    }
*/
function initWatch(vm) {  //处理watch
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; //这里的handler可能是数组  字符串  函数 对象

    if (Array.isArray(handler)) {
      //如果是数组的话  循环操作 将数组中的每个值都创建watcher
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler); //不是数组 直接创建watcher
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler == "string") {
    //如果handler为字符串  就去methods中调用对应方法
    hanlder = vm[handler]; //methods中的方法都绑定在实例上
  }
  if (handler.handler) {
    //如实handler是一个对象 中间包含了handler方法
    handler = handler["handler"];
  }

  return vm.$watch(key, handler);
}

//初始化data
function initData(vm) {
  //判断 data是函数  还是 对象
  let data = vm.$options.data;
  data = typeof data == "function" ? data.call(vm) : data;

  vm._data = data; //将data挂载到vm实例上  但是访问属性 变成vm._data.xxx
  //对数据进行劫持
  observe(data);

  for (let k in data) {
    proxy(vm, "_data", k);
  }
}

function proxy(vm, data, k) {
  Object.defineProperty(vm, k, {
    get() {
      return vm[data][k];
    },
    set(newValue) {
      vm[data][k] = newValue;
    },
  });
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;

  Vue.prototype.$watch = function (expreOrFn, handler) {
    //express针对调用的this.$watch
    new Watcher(this, expreOrFn, { user: true }, handler); //$watch功能简单  就是创造了一个watcher
  };
}
