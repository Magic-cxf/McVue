
import { initMixin } from "./init";
import { initGlobalAPI } from "./initGlobalAPI";
import { initLifeCycle} from "./lifecycle";

import { initStateMixin } from "./state";

function Vue(options) {
  this._init(options); //初始化 状态
}

initMixin(Vue); //初始化状态 合并options  初始化data computed watch  挂载$mount函数到原型上
initLifeCycle(Vue); //初始化render和update函数  挂载到原型上
initGlobalAPI(Vue); //初始化minxin
initStateMixin(Vue); //初始化异步更新机制  $nextTick  和$watch方法


export default Vue;
