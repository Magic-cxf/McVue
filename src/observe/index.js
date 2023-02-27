import { newArrayProto } from "./array";
import { Dep }from "./dep";

class Observe {
  constructor(data) {
    // 将this 绑定为data的一个变量   方便 data对自己添加的数据进行观测 以及
    //通过这个属性 判断data是否已经被观测过
    //不能直接赋值 data.__ob__=this  会造成死循环
    this.dep = new Dep()   //给每一个数据对象都建立一个依赖收集者

    Object.defineProperty(data, "__ob__", {
      //不可枚举   在对对象观测时  不会对这个属性观测
      value: this,
      enumerable: false,
    });

    if (Array.isArray(data)) {
      //修改数组本身重写7个方法  还要将数组中的引用数据类型 进行劫持

      data.__proto__ = newArrayProto;

      this.observeArray(data); //如果数组中存放的对象 可以劫持到
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    //循环对象  对属性依次进行劫持

    //"重新定义属性"
    Object.keys(data).forEach((k) => defineReactive(data, k, data[k]));
  }
  observeArray(data) {
    data.forEach((i) => observe(i));
  }
}

function arrayDep(v){
  for(let i =0; i < v.length;i++){
    let current = v[i]
    current.__ob__  && current.__ob__.dep.add()
    if(Array.isArray(current)){
      arrayDep(current)
    }
  }
}

export function defineReactive(data, k, v) {
  
  //闭包   属性劫持  依赖闭包
  let childOb = observe(v); //判断v是否是对象
  let dep = new Dep();
  Object.defineProperty(data, k, {
    get() {
      if (Dep.target) {
        //渲染的时候 从vm取值  就会把watcher加入到dep中
        dep.add();
        if(childOb && childOb.dep){  //需要判断childOb是不是为空 
          childOb.dep.add()    //如果是数组 或者对象 手机依赖 
          if(Array.isArray(v)){   //如果是数组嵌套数组
            arrayDep(v)   //继续监听 
          }
        }
      }
      return v;
    },
    set(newValue) {
      if (newValue == v) return;
      v = newValue;
      observe(v);
      dep.notify();
    },
  });
}

//对对象进行劫持
export function observe(data) {
  //对对象进行劫持
  if (typeof data !== "object" || data == null) {
    return; //只对对象劫持
  }
  //如果对象被劫持过了， 就不需要再被劫持了   通过data上的__ob__判断 是否已经被观测过
  if (data.__ob__ instanceof Observe) {
    return data.__ob__;
  }

  return new Observe(data);      //对对象进行劫持 
}
