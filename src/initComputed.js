//初始化computed属性  
//实现的computed的响应式

import { Dep } from "./observe/dep"
import { Watcher } from "./observe/watcher"

export function initComputed(vm){   //初始化computed  
    let computed = vm.$options.computed    
    let watchers = vm._computedWatchers = {}   //将计算属性的watcher保存到当前实例上
    for(let key in computed){
        let userDef = computed[key]
        const getter = typeof userDef == "function"? userDef :userDef.get
        watchers[key] = new Watcher(vm,getter,{lazy:true})   //computed的每个属性都创建一个watcher
        defineComputed(vm,key,userDef)   //将computed的每个属性都定义到当前实例上  
    }
}


function defineComputed(vm,key,userDef){
    const setter = userDef.set || (() =>{})
    Object.defineProperty(vm,key,{    //将每个key都定义到当前实例上  
        get:createComputedValue(key),   //重写 get方法    实现缓存以及响应式更新
        set:setter
    })
}


function createComputedValue(key){
 
    return function(){
        const watcher = this._computedWatchers[key]     //利用watcher将结果缓存来了 结果为watcher.value
        if(watcher.dirty){   // watcher调用回调函数后 将dirty值改为false  
            watcher.evaluate()   //   watcher中 调用回调函数 获得结果  保存在watcher.value中  将dirty改完false
        }                         
        if(Dep.target){   //如果还有渲染watcher  要将该渲染watcher加入到计算属性的依赖属性的依赖中  
            watcher.depend()   //->wathcer.deps[name_dep,age_dep] 等  让他们收集当前的dep.target watcher
        }
        return watcher.value   //返回的就是缓存的结果 
    }
}