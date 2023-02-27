
//h()  _c()

// //判断是原始标签 还是组件 可以从vm.$options.components[tag]  判断 应该也可以
// const isOriginalTag = (tag)=>{
//     return ['div','p','span','button','ul','li'].includes(tag)
// }
export function createElementVNode(vm,tag,data,...children){
    if(data == null){
        data={}
    }
    let key = data.key
    if(key){
        delete data.key
    }
    if(tag == 'component'){   //实现component功能  
        let component = data['is']
        let Ctor = vm.$options.components[component]
        return createComponentVnode(vm,tag,key,data,children,Ctor)
    }
    if(vm.$options.components[tag]){  //如果components中有值  则为组件 否则为原始标签

        //Ctor可能为构造函数 也有可能为对象  
        let Ctor = vm.$options.components[tag]
        return createComponentVnode(vm,tag,key,data,children,Ctor)
    }else{
        return vnode(vm,tag,key,data,children)
    }
    
}

//创建组件虚拟节点
function createComponentVnode(vm,tag,key,data,children,Ctor){
    if(typeof Ctor == "object"){
        Ctor = vm.$options._base.extend(Ctor)
    }
    data.hook = {
        init(vnode){
            //获取组件实例 
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
            instance.$mount()   //挂载组件实例  获取组件的$el
        }
    }
    return vnode(vm,tag,key,data,children,null,{Ctor})
}


//_v()
export function createTextVNode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text,null)
}


function vnode(vm,tag,key,data,children,text,componentOptions){   
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions
    }
}