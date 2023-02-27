import  { Dep, popWatcher, pushWatcher } from "./dep"

let id = 0


//每个组件都会单独创建一个watcher
//创建渲染watcher的时候  将watcher实例放到一个全局变量上
export class Watcher{
    constructor(vm,exectuor,options,cb){
        this.id = id++   //每一个watcher唯一的ID  
        if(typeof exectuor == "string"){
            this.getter = function (){
                return vm[exectuor]   //如果是字符串 就变为函数  
            }
        }else{
            this.getter = exectuor    
        }
 
        this.vm = vm
        this.cb = cb  //$watch中传入的回调函数
        this.renderWatcher = options  //判断是否为渲染watcher 即new的时候会不会调用exectuor
        this.deps = []   //每一个watcher收集dep
        this.depsId = new Set()  //利用集合去重  让dep中不收集重复的watcher
        this.options = options
        this.user = options.user?options.user:undefined   //判断user   是否为watch中的属性
        this.lazy = this.options.lazy
        this.dirty = this.options.lazy
        this.value = this.dirty?undefined:this.get()  
         //如果是lazy的话 表明是计算属性的watcher 先创建 不访问数据
         //如果是用户自己的watcher   第一次调用 返回的就是老值   同时将watcher收集到该属性的dep中
    }
    evaluate(){
        this.value = this.get()
        this.dirty = false
    }
    depend(){
        let i = this.deps.length
        while(i--){
            this.deps[i].add()   //[name_dep,age_dep]  让这些属性的dep收集外层渲染watcher
        }
    }
    get(){   //会去vm上取值    渲染的时候  
        pushWatcher(this)
        let value = this.getter.call(this.vm)
        popWatcher()
        return value
    }  //收集dep 并去重   并且让dep收集watcher  你中有我 我中有你  
    addDep(dep){
        let id = dep.id
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }
    update(){
        if(this.lazy){      //如果是lazy属性 表明是计算属性的watcher    更新的时候 要将dirty值改完true
            this.dirty = true        //即代表计算属性的值发生的改变  下一次访问 就可以调用evaluate方法更新值
        }else{
            queueWatcher(this)   //将所有的需要更新的watcher加入到一个队列中
        }
        //this.get()这是立即更新   需要优化 
    }
    run(){
        let oldValue = this.value   //老值  
        let newValue = this.get()
        if(this.user){   //如果是用户自己的watcher
            this.cb.call(this.vm,oldValue,newValue)
        }
        //this.get()  //真正调用回调函数
    }
}

let queue = []
let pending = false
let has = new Set()
//一个队列 用来维护需要更新的watcher
function queueWatcher(watcher){
    let id = watcher.id
    if(!has.has(id)){
        queue.push(watcher)
        has.add(id)
        if(!pending){
            nextTick(flushScheduleQueue)
            pending = true
        }
    }
}
//将队列中的watcher都进行刷新并清空
function flushScheduleQueue(){
    let flushqueue = queue.slice(0)
    queue = []
    pending = false
    has.clear()   //将has清空 
    flushqueue.forEach(watcher => watcher.run())
}



//一个队列 用过来维护nextTick中的任务
let callbacks = []
let waiting = false
export function nextTick(exectuor){
    callbacks.push(exectuor)
    if(!waiting){
        Promise.resolve().then(flushCallBacks);   //直接用promise微任务     降级 用mutationObserve   
        waiting = true   //最后用setTimeout setMediate 
    }
}

function flushCallBacks(){
    let calls = callbacks.slice(0)
    callbacks = []
    waiting = false
    calls.forEach(exectuor =>exectuor())
}