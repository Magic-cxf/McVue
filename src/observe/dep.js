let id = 0;

export class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; //存放 当前属性对应的watcher有哪些
  }
  add() {
    //this.subs.push(Dep.target)    这么写不能去重  对于重复的watcher  不需要收集
    Dep.target.addDep(this); //先让watcher记住  该dep  再在watcher中  将watcher加入到dep中
  }
  //将watcher收集到dep中
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

Dep.target = null;
let globalWatcher = []   //维护全局watcher栈 
//渲染的时候  渲染watcher第一个进栈  最后一个出栈
export function pushWatcher(watcher){
  globalWatcher.push(watcher)
  Dep.target = watcher
}

export function popWatcher(){
  globalWatcher.pop()
  Dep.target = globalWatcher[globalWatcher.length-1]
}


