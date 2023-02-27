import { createElementVNode, createTextVNode } from "./vdom/index";
import { Watcher } from "./observe/watcher";

//实现了mountComponet方法  将组件挂载到真是DOM上
export function mountComponent(vm, el) {
  vm.$el = el; //将el 挂载到实例的$el上

  //1.调用render方法产生虚拟节点   调用update方法  获取新DOM  并将原DOM替换掉
  const updateComponent = () => {
    vm._update(vm._render()); //更新试图的核心方法
  };
  const watcher = new Watcher(vm, updateComponent, { lazy: false });
  //2.根据虚拟DOM  产生真是DOM
  //3.插入到el中
}

function patchProps(el, oldProps = {}, newProps = {}) {
  //传入参数 为真是DOM,老的虚拟节点上的属性，新的虚拟节点上的属性
  //老的属性中有，新的属性中没有
  let oldStyles = oldProps.style ? oldProps.style : {}; //老的虚拟节点中的style
  let newStyles = newProps.style ? newProps.style : {}; //新的虚拟节点中的style

  for (let key in oldStyles) {
    if (newStyles[key]) {
      //如果老的有 某种样式 新的没有  清空
      el.style[key] = "";
    }
  }

  for (let key in oldProps) {
    //  如果老的有某种属性 新的没有 清空
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  for (let k in newProps) {  //
    if (k == "style") {
      for (let stylename in newProps.style) {
        el.style[stylename] = newProps.style[stylename];
      }
    } else {
        el.setAttribute(k, newProps[k]);
      
    }
  }
}

function createComponent(vnode){
  let i = vnode.data
  if( (i= i.hook) && (i = i.init)){
    i(vnode)
    return true
  }else{
    return false
  }
}

export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag == "string") {

    if(createComponent(vnode)){   //如果是组件节点 
      
      return vnode.componentInstance.$el   //返回组件节点的真是DOM元素
    }

    vnode.el = document.createElement(tag); //利用标签创建元素   将元素放到虚拟节点的el上

    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child)); //将子节点变为元素的子节点
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el; //返回创建的真实节点
}


//patch函数实现
export function patch(oldVNode, newVNode) {
  //这里传入进来的oldVNode为app dom  进行的是初始渲染

  if(!oldVNode){     //若为组件节点      
    return createElm(newVNode)   //创建组件节点的真实DOM并返回
  }

  let isRealEle = oldVNode.nodeType;
  if (isRealEle) {
    //如果是初始渲染  就通过vnode创建新的dom树
    let elm = oldVNode; //获取真实元素
    let parentNode = elm.parentNode; //拿到父元素
    let newElm = createElm(newVNode); //通过虚拟节点创建真实节点

    parentNode.insertBefore(newElm, elm.nextSibling); //将真是节点插入到页面中
    parentNode.removeChild(elm); //删除原来的节点

    return newElm; //返回新的真实dom节点
  } else {
    //这里则是两个虚拟节点  之间的比较   diff算法实现的地方
    //1.两个节点不是同一个节点    则直接删除原来节点 换上新的节点
    //2.两个虚拟节点是同一个节点   tag相同  key相同 再比较节点上的属性的差异 复用老的节点将差异属性更新
    if (!isSameNode(oldVNode, newVNode)) {
      //如果不是同一个节点  直接删除旧节点 创建新节点
      let el = createElm(newVNode);
      oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
      return el;
    } else {
      //比较两个一样的虚拟节点
      return patchVnode(oldVNode, newVNode); //返回比对完毕的真是DOM节点
    }
  }
}

function isSameNode(oldVNode, newVNode) {
  return oldVNode.tag == newVNode.tag && oldVNode.key == newVNode.key;
}

function patchVnode(oldVNode, newVNode) {
  //这里就是对相同的虚拟节点进行比较
  let el = (newVNode.el = oldVNode.el); //复用旧节点  赋值给新节点

  if (!el.tag) {
    //判断是否是文本节点   文本内容 就判断一下文本内容是否一致
    if (oldVNode.text != newVNode.text) {
      //如果新的虚拟文本节点中的内容和旧的不一样  就把text内容覆盖掉
      el.textContent = newVNode.text;
    }
  }

  //是元素节点  先要比元素上的属性
  patchProps(el, oldVNode.data, newVNode.data);

  //开始比较两个虚拟节点上的儿子
  let oldChildren = oldVNode.children ? oldVNode.children : [];
  let newChildren = newVNode.children ? newVNode.children : [];

  if (oldChildren.length > 0 && newChildren.length > 0) {
    //两个都有儿子节点  走diff算法
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    mountChildren(el, newChildren); //老的虚拟节点中没有儿子  新的虚拟节点中有儿子
  } else if (oldChildren.length > 0) {
    //将新的虚拟节点中的儿子创建出来并挂载到DOM中
    // unmountedChildren(el)  循环删除节点
    el.innerHTML = ""; //直接清空  不能这么做
  }

  return el;
}

//diff算法的核心地方     对两方的儿子进行比较
function updateChildren(el, oldChildren, newChildren) {
  //利用双指针算法
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  //通过老节点 创建映射表
  function makeIndexByKey(arr) {
    let map = {};
    arr.forEach((child, index) => {
      map[child.key] = index; //制作索引表 通过key
    });
    return map;
  }
  let map = makeIndexByKey(oldChildren);
  //从头开始  双方的头指针向后移动 为指针向头移动   双方都需要满足这个条件
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      continue
    } else if (!oldEndVnode) {
      continue;
    } else if (isSameNode(oldStartVnode, newStartVnode)) {
      //如果第一个节点是相同节点 则递归比较子节点 从头开始
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameNode(oldEndVnode, newEndVnode)) {
      //从尾巴开始 如果尾巴节点相同  就从尾巴向头部移动
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameNode(oldStartVnode, newStartVnode)) {
      //头尾对比  数组是否颠倒
      patchVnode(oldStartVnode, newStartVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameNode(oldEndVnode, newStartVnode)) {
      //尾头对比
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];

      //乱序比对 根据旧的节点创建映射表  用新的节点去匹配
      //找不到就插入头部 找到就移动位置  多余的删除
    } else {
      let moveIndex = map[newStartVnode.key];
      if (moveIndex != undefined) {
        //如果找到了老的节点
        let moveVNode = newChildren[moveIndex]; //拿到老的虚拟节点   进行复用
        el.insertBefore(moveVNode.el, oldStartVnode.el); //将该老的节点插入到头部
        oldChildren[moveIndex] = undefined; //表示这个节点已经挪走了
        patchVnode(moveVNode, newStartVnode);
      } else {
        //如果没有找到老的节点  就直接将新的虚拟节点创建为真实节点并插入到头部中
        let newChild = createElm(newStartVnode);
        el.insertBefore(newChild, oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex]; //将新的children的头部指针往后移动
    }
  }
  //新的儿子节点数量比老的多   将新的儿子节点插入到dom上 要处理是插到之前 还是之后
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);

      //处理是插入到尾巴 还是插入到头部
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      //若anchor为空   则是向后追加
      el.insertBefore(childEl, anchor);
    }
  }
  //老的子节点多了 就要删除老的上面的节点
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) { //空节点不处理   只有有内容的节点 才处理
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}

function mountChildren(el, newChildren) {
  //将新的虚拟节点中的儿子都挂载到真是DOM上
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._render = function () {
    //当渲染的时候会去实例取值 我们就可以将数据和视图绑定
    return this.$options.render.call(this);
  };
  Vue.prototype._update = function (vnode) {   //核心所在   update方法
    //patch方法 既有初始化的功能 也有更新的功能
    const vm = this;
    const el = vm.$el;
    // vm.$el = patch(el, vnode); //将新的dom节点挂载到实例的$el属性上
   

    const preVnode = vm._vnode   //第一次渲染的时候没有vm._vnode
    vm._vnode = vnode    //将该虚拟节点保存在实例上  

    if(preVnode){  //如果存在虚拟node 说明之前已经渲染过了  
      vm.$el = patch(preVnode,vnode)
    }else{
      vm.$el = patch(el,vnode)
    }
  };
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value == "object") return JSON.stringify(value);
    return value;
  };
}
