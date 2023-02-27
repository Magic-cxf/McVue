const strategy = {};
const LIFECYCLE = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

LIFECYCLE.forEach((hook) => {
  strategy[hook] = function (p, c) {
    if (c) {
      //如果儿子有
      if (p) {
        //如果儿子有  父亲也有
        return p.concat(c);
      } else {
        //如果儿子有 父亲没有 将儿子包装成数组
        return [c];
      }
    } else {
      //如果儿子没有  直接返回父亲
      return p;
    }
  };
});


//处理组件中有components属性的情况  合并component
//构建链式关系  自己当前找不到 可以沿着链找到 
strategy.components = function(parentVal,childVal){  
  const res = Object.create(parentVal)

  if(childVal){
    for(let key in childVal){
      res[key] = childVal[key]
    }
  }
  
  return res
}



//合并options的功能
export function mergeOptions(parent, child) {
  const options = {}; //定义一个空options

  function mergeField(key) {
    //合并key值
    if (strategy[key]) {
      options[key] = strategy[key](parent[key], child[key]);
    } else {
      //如果不在策略中  以儿子为主
      options[key] = child[key] || parent[key];
    }
  }
  for (let key in parent) {
    //遍历父亲中的key
    mergeField(key); //将父亲和儿子都有的进行合并
  }
  for (let key in child) {
    //遍历儿子
    if (!parent.hasOwnProperty(key)) {
      //如果父亲上没有儿子的这个属性
      mergeField(key); //将儿子的这个属性合并
    }
  }

  return options; //返回合并后的options
}

export function callHook(vm, hook) {
  const handler = vm.$options[hook];
  if (handler) {
    handler.forEach((hook) => hook.call(vm));
  }
}
