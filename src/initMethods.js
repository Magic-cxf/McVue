
//初始化methods
export function initMethods(vm){
    const methods = vm.$options.methods
    for(let key in methods){
        createMethod(vm,key,methods[key])
        console.log(key)
    }
}


function createMethod(vm,key,value){
    Object.defineProperty(vm,key,{
        get(){
            return value.bind(vm)
        }
    })
}