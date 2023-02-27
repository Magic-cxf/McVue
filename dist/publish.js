//实现发布订阅模式  



//发布订阅模式  真简单  比观察者模式简单啊
class eventBus{
    constructor(){
        this.subs = new Map()
    }
    on(eventName,exectuor){   //订阅事件
        if(!this.subs.get(eventName)){
            let eventList = []
            this.subs.set(eventName,eventList)
            eventList.push(exectuor)
            return 
        }
        this.subs.get(eventName).push(exectuor)
    }
    send(eventName){   //发布事件
        if(!this.subs.get(eventName)){
            console.warn("no subscribes");
        }
        this.subs.get(eventName).forEach(element => {
            element()
        });
    }
    //取消订阅事件  
    cancel(){

    }
    //清空所有的订阅事件
    clear(){

    }
}

//有一天 你会不会后悔干了这一行 哈哈   不会后悔的  对吧  加油  打工人  


const dep = new eventBus()

dep.on('changename',()=>{
    console.log("订阅了改变姓名事件1")
})

dep.on('changename',()=>{
    console.log("订阅了改变姓名事件2")
})

dep.send('changename')





// test(arg1,arg2,arg3)  =>test(arg1)(arg2)(arg3)

function test(arg1){
    return function(arg2){
        return arg1+arg2
    }
}

//最简单的函数柯里化  只能传两个参数
function createCurry(fn){
    const slice = Array.prototype.slice
    const save_args = slice.call(arguments,1)

    return function(){
        let newArgs = slice.call(arguments)
        args = save_args.concat(newArgs)
        fn.apply(null,args)
    }
}



//灵活一点的柯里化  