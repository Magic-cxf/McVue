(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      this.subs = []; //存放 当前属性对应的watcher有哪些
    }
    _createClass(Dep, [{
      key: "add",
      value: function add() {
        //this.subs.push(Dep.target)    这么写不能去重  对于重复的watcher  不需要收集
        Dep.target.addDep(this); //先让watcher记住  该dep  再在watcher中  将watcher加入到dep中
      }
      //将watcher收集到dep中
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;
  var globalWatcher = []; //维护全局watcher栈 
  //渲染的时候  渲染watcher第一个进栈  最后一个出栈
  function pushWatcher(watcher) {
    globalWatcher.push(watcher);
    Dep.target = watcher;
  }
  function popWatcher() {
    globalWatcher.pop();
    Dep.target = globalWatcher[globalWatcher.length - 1];
  }

  var id = 0;

  //每个组件都会单独创建一个watcher
  //创建渲染watcher的时候  将watcher实例放到一个全局变量上
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exectuor, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++; //每一个watcher唯一的ID  
      if (typeof exectuor == "string") {
        this.getter = function () {
          return vm[exectuor]; //如果是字符串 就变为函数  
        };
      } else {
        this.getter = exectuor;
      }
      this.vm = vm;
      this.cb = cb; //$watch中传入的回调函数
      this.renderWatcher = options; //判断是否为渲染watcher 即new的时候会不会调用exectuor
      this.deps = []; //每一个watcher收集dep
      this.depsId = new Set(); //利用集合去重  让dep中不收集重复的watcher
      this.options = options;
      this.user = options.user ? options.user : undefined; //判断user   是否为watch中的属性
      this.lazy = this.options.lazy;
      this.dirty = this.options.lazy;
      this.value = this.dirty ? undefined : this.get();
      //如果是lazy的话 表明是计算属性的watcher 先创建 不访问数据
      //如果是用户自己的watcher   第一次调用 返回的就是老值   同时将watcher收集到该属性的dep中
    }
    _createClass(Watcher, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          this.deps[i].add(); //[name_dep,age_dep]  让这些属性的dep收集外层渲染watcher
        }
      }
    }, {
      key: "get",
      value: function get() {
        //会去vm上取值    渲染的时候  
        pushWatcher(this);
        var value = this.getter.call(this.vm);
        popWatcher();
        return value;
      } //收集dep 并去重   并且让dep收集watcher  你中有我 我中有你  
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          //如果是lazy属性 表明是计算属性的watcher    更新的时候 要将dirty值改完true
          this.dirty = true; //即代表计算属性的值发生的改变  下一次访问 就可以调用evaluate方法更新值
        } else {
          queueWatcher(this); //将所有的需要更新的watcher加入到一个队列中
        }
        //this.get()这是立即更新   需要优化 
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value; //老值  
        var newValue = this.get();
        if (this.user) {
          //如果是用户自己的watcher
          this.cb.call(this.vm, oldValue, newValue);
        }
        //this.get()  //真正调用回调函数
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var pending = false;
  var has = new Set();
  //一个队列 用来维护需要更新的watcher
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has.has(id)) {
      queue.push(watcher);
      has.add(id);
      if (!pending) {
        nextTick(flushScheduleQueue);
        pending = true;
      }
    }
  }
  //将队列中的watcher都进行刷新并清空
  function flushScheduleQueue() {
    var flushqueue = queue.slice(0);
    queue = [];
    pending = false;
    has.clear(); //将has清空 
    flushqueue.forEach(function (watcher) {
      return watcher.run();
    });
  }

  //一个队列 用过来维护nextTick中的任务
  var callbacks = [];
  var waiting = false;
  function nextTick(exectuor) {
    callbacks.push(exectuor);
    if (!waiting) {
      Promise.resolve().then(flushCallBacks); //直接用promise微任务     降级 用mutationObserve   
      waiting = true; //最后用setTimeout setMediate 
    }
  }

  function flushCallBacks() {
    var calls = callbacks.slice(0);
    callbacks = [];
    waiting = false;
    calls.forEach(function (exectuor) {
      return exectuor();
    });
  }

  //初始化computed属性  
  function initComputed(vm) {
    //初始化computed  
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //将计算属性的watcher保存到当前实例上
    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef == "function" ? userDef : userDef.get;
      watchers[key] = new Watcher(vm, getter, {
        lazy: true
      }); //computed的每个属性都创建一个watcher
      defineComputed(vm, key, userDef); //将computed的每个属性都定义到当前实例上  
    }
  }

  function defineComputed(vm, key, userDef) {
    var setter = userDef.set || function () {};
    Object.defineProperty(vm, key, {
      //将每个key都定义到当前实例上  
      get: createComputedValue(key),
      //重写 get方法    实现缓存以及响应式更新
      set: setter
    });
  }
  function createComputedValue(key) {
    return function () {
      var watcher = this._computedWatchers[key]; //利用watcher将结果缓存来了 结果为watcher.value
      if (watcher.dirty) {
        // watcher调用回调函数后 将dirty值改为false  
        watcher.evaluate(); //   watcher中 调用回调函数 获得结果  保存在watcher.value中  将dirty改完false
      }

      if (Dep.target) {
        //如果还有渲染watcher  要将该渲染watcher加入到计算属性的依赖属性的依赖中  
        watcher.depend(); //->wathcer.deps[name_dep,age_dep] 等  让他们收集当前的dep.target watcher
      }

      return watcher.value; //返回的就是缓存的结果 
    };
  }

  //初始化methods
  function initMethods(vm) {
    var methods = vm.$options.methods;
    for (var key in methods) {
      createMethod(vm, key, methods[key]);
      console.log(key);
    }
  }
  function createMethod(vm, key, value) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return value.bind(vm);
      }
    });
  }

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      ob.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // 将this 绑定为data的一个变量   方便 data对自己添加的数据进行观测 以及
      //通过这个属性 判断data是否已经被观测过
      //不能直接赋值 data.__ob__=this  会造成死循环
      this.dep = new Dep(); //给每一个数据对象都建立一个依赖收集者

      Object.defineProperty(data, "__ob__", {
        //不可枚举   在对对象观测时  不会对这个属性观测
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        //修改数组本身重写7个方法  还要将数组中的引用数据类型 进行劫持

        data.__proto__ = newArrayProto;
        this.observeArray(data); //如果数组中存放的对象 可以劫持到
      } else {
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //循环对象  对属性依次进行劫持

        //"重新定义属性"
        Object.keys(data).forEach(function (k) {
          return defineReactive(data, k, data[k]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (i) {
          return observe(i);
        });
      }
    }]);
    return Observe;
  }();
  function arrayDep(v) {
    for (var i = 0; i < v.length; i++) {
      var current = v[i];
      current.__ob__ && current.__ob__.dep.add();
      if (Array.isArray(current)) {
        arrayDep(current);
      }
    }
  }
  function defineReactive(data, k, v) {
    //闭包   属性劫持  依赖闭包
    var childOb = observe(v); //判断v是否是对象
    var dep = new Dep();
    Object.defineProperty(data, k, {
      get: function get() {
        if (Dep.target) {
          //渲染的时候 从vm取值  就会把watcher加入到dep中
          dep.add();
          if (childOb && childOb.dep) {
            //需要判断childOb是不是为空 
            childOb.dep.add(); //如果是数组 或者对象 手机依赖 
            if (Array.isArray(v)) {
              //如果是数组嵌套数组
              arrayDep(v); //继续监听 
            }
          }
        }

        return v;
      },
      set: function set(newValue) {
        if (newValue == v) return;
        v = newValue;
        observe(v);
        dep.notify();
      }
    });
  }

  //对对象进行劫持
  function observe(data) {
    //对对象进行劫持
    if (_typeof(data) !== "object" || data == null) {
      return; //只对对象劫持
    }
    //如果对象被劫持过了， 就不需要再被劫持了   通过data上的__ob__判断 是否已经被观测过
    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }
    return new Observe(data); //对对象进行劫持 
  }

  function initState(vm) {
    //初始化
    var opts = vm.$options;
    // if(opts.props){
    //     initProps()
    // }
    if (opts.data) {
      initData(vm); //初始化data属性
    }

    if (opts.computed) {
      //初始化computed属性
      initComputed(vm);
    }
    if (opts.watch) {
      initWatch(vm);
    }
    if (opts.methods) {
      console.log("初始化methods");
      initMethods(vm);
    }
  }

  //初始化watch
  /*
      watch:{
          good(newValue,oldValue){
              xxxx
          }
      }
  */
  function initWatch(vm) {
    //处理watch
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; //这里的handler可能是数组  字符串  函数 对象

      if (Array.isArray(handler)) {
        //如果是数组的话  循环操作 将数组中的每个值都创建watcher
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler); //不是数组 直接创建watcher
      }
    }
  }

  function createWatcher(vm, key, handler) {
    if (typeof handler == "string") {
      //如果handler为字符串  就去methods中调用对应方法
      hanlder = vm[handler]; //methods中的方法都绑定在实例上
    }

    if (handler.handler) {
      //如实handler是一个对象 中间包含了handler方法
      handler = handler["handler"];
    }
    return vm.$watch(key, handler);
  }

  //初始化data
  function initData(vm) {
    //判断 data是函数  还是 对象
    var data = vm.$options.data;
    data = typeof data == "function" ? data.call(vm) : data;
    vm._data = data; //将data挂载到vm实例上  但是访问属性 变成vm._data.xxx
    //对数据进行劫持
    observe(data);
    for (var k in data) {
      proxy(vm, "_data", k);
    }
  }
  function proxy(vm, data, k) {
    Object.defineProperty(vm, k, {
      get: function get() {
        return vm[data][k];
      },
      set: function set(newValue) {
        vm[data][k] = newValue;
      }
    });
  }
  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (expreOrFn, handler) {
      //express针对调用的this.$watch
      new Watcher(this, expreOrFn, {
        user: true
      }, handler); //$watch功能简单  就是创造了一个watcher
    };
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的是一个标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配到的是结束的标签名
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
  var startTagClose = /^\s*(\/?)>/;

  //从template中解析标签  解析一段就删一段
  //parseHTML生成一棵AST  对html一段一段解析 删除  利用正则匹配
  //生成一棵AST树   利用栈维护     =>字符串拼接 很恶心  返回一棵树
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素
    var currentParent; //指针  指向栈中的最后一个
    var root;
    function creatASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      var node = creatASTElement(tag, attrs); //得到节点
      if (!root) {
        //判断是否为根节点
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent; //设置当前节点的父节点
        currentParent.children.push(node);
      }
      stack.push(node); //将节点存入栈中
      currentParent = node; //将父节点指向栈中最后一个节点
    }

    function chars(text) {
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop(); //弹出最后一个  
      currentParent = stack[stack.length - 1];
    }
    function parseStart() {
      //处理开始标签
      var start = html.match(startTagOpen); //匹配开始标签
      if (start) {
        var match = {
          //构建一个对象
          tag: start[1],
          attrs: []
        };
        advance(start[0].length); //匹配到开始标签后 一直匹配下去  直到开始标签的结束

        var attr, _end;
        while (
        //不是结束标签  将属性一直匹配来 并且将属性
        !(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          //一直匹配下去

          advance(attr[0].length); //继续删除匹配到的属性
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          }); //将匹配到的attr加入
        }

        if (_end) {
          //如果匹配到了开始标签的结束标签  就删掉
          advance(_end[0].length);
        }
        return match;
      }
      return false; //不是开始标签
    }

    function advance(n) {
      //前进n个位置  即删除一段html
      html = html.substring(n);
    }
    while (html) {
      var text_end = html.indexOf("<"); //匹配<开始
      if (text_end == 0) {
        //若为0  表示为标签的开始
        var startTagMatch = parseStart(); //开始标签的匹配结果
        if (startTagMatch) {
          //如果匹配到的仍是开始标签
          start(startTagMatch.tag, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (text_end > 0) {
        //若大于0 则表示为文本
        var text = html.substring(0, text_end);
        if (text.length > 0) {
          advance(text.length); //将文本删除即可
          chars(text);
        }
      }
    }
    return root;
  }

  /*
   * <div>
          <div></div>
          <span></span>
      </div>
   * 
   */
  function genProps(attrs) {
    var str = '';
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        })();
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配{{}}中间的表达式  一定要去掉修饰符g
  function gen(node) {
    if (node.type == 1) {
      //如果是元素节点  直接调用codegen
      return codegen(node);
    } else {
      //如果是文本节点
      defaultTagRE.lastIndex = 0; //将正则匹配的开始位置置0
      if (!defaultTagRE.test(node.text)) {
        return "_v(".concat(JSON.stringify(node.text), ")");
      } else {
        defaultTagRE.lastIndex = 0; //将正则的lastindenx 置为0
        var text = node.text; //拿到文本内容 
        var res; //定义匹配的结果
        var startindex, endindex;
        startindex = 0;
        var result = []; //用数组维护 获得的结果   _s(name)+_v(text)+_(age)
        while (res = defaultTagRE.exec(text)) {
          //通过正则匹配{{}}中间的内容
          endindex = res.index;
          if (endindex > startindex) {
            result.push("\"".concat(text.slice(startindex, endindex), "\""));
          }
          result.push("_s(".concat(res[1], ")"));
          startindex = endindex + res[0].length;
        }
        if (startindex < text.length) {
          //判断是否还有文本内容  
          result.push("\"".concat(text.slice(startindex, text.length), "\""));
        }
        return "_v(".concat(result.join("+"), ")"); //返回格式  _v(_s(name)+"xx"+_s(age))
      }
    }
  }

  function genChildren(children) {
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c(\"".concat(ast.tag, "\",    \n  ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', "   \n  ").concat(ast.children.length > 0 ? ",".concat(children) : "", "    \n  )");
    return code;
  }
  function compileToFunction(template) {
    //1.第一步 生成AST语法树
    //2.第二步  将抽象语法树转换为render函数   render函数返回的结果就是虚拟DOM

    var ast = parseHTML(template); //生成AST语法树
    var code = "with(this){return ".concat(codegen(ast), "}"); //render函数的实现   
    var render = new Function(code); //模板引擎的原理     利用with 和 new Function 
    return render;
  }

  //h()  _c()

  // //判断是原始标签 还是组件 可以从vm.$options.components[tag]  判断 应该也可以
  // const isOriginalTag = (tag)=>{
  //     return ['div','p','span','button','ul','li'].includes(tag)
  // }
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    if (tag == 'component') {
      //实现component功能  
      var component = data['is'];
      var Ctor = vm.$options.components[component];
      return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
    if (vm.$options.components[tag]) {
      //如果components中有值  则为组件 否则为原始标签

      //Ctor可能为构造函数 也有可能为对象  
      var _Ctor = vm.$options.components[tag];
      return createComponentVnode(vm, tag, key, data, children, _Ctor);
    } else {
      return vnode(vm, tag, key, data, children);
    }
  }

  //创建组件虚拟节点
  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (_typeof(Ctor) == "object") {
      Ctor = vm.$options._base.extend(Ctor);
    }
    data.hook = {
      init: function init(vnode) {
        //获取组件实例 
        var instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
        instance.$mount(); //挂载组件实例  获取组件的$el
      }
    };

    return vnode(vm, tag, key, data, children, null, {
      Ctor: Ctor
    });
  }

  //_v()
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text, null);
  }
  function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }

  //实现了mountComponet方法  将组件挂载到真是DOM上
  function mountComponent(vm, el) {
    vm.$el = el; //将el 挂载到实例的$el上

    //1.调用render方法产生虚拟节点   调用update方法  获取新DOM  并将原DOM替换掉
    var updateComponent = function updateComponent() {
      vm._update(vm._render()); //更新试图的核心方法
    };

    new Watcher(vm, updateComponent, {
      lazy: false
    });
    //2.根据虚拟DOM  产生真是DOM
    //3.插入到el中
  }

  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //传入参数 为真是DOM,老的虚拟节点上的属性，新的虚拟节点上的属性
    //老的属性中有，新的属性中没有
    var oldStyles = oldProps.style ? oldProps.style : {}; //老的虚拟节点中的style
    var newStyles = newProps.style ? newProps.style : {}; //新的虚拟节点中的style

    for (var key in oldStyles) {
      if (newStyles[key]) {
        //如果老的有 某种样式 新的没有  清空
        el.style[key] = "";
      }
    }
    for (var _key in oldProps) {
      //  如果老的有某种属性 新的没有 清空
      if (!newProps[_key]) {
        el.removeAttribute(_key);
      }
    }
    for (var k in newProps) {
      //
      if (k == "style") {
        for (var stylename in newProps.style) {
          el.style[stylename] = newProps.style[stylename];
        }
      } else {
        el.setAttribute(k, newProps[k]);
      }
    }
  }
  function createComponent(vnode) {
    var i = vnode.data;
    if ((i = i.hook) && (i = i.init)) {
      i(vnode);
      return true;
    } else {
      return false;
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag == "string") {
      if (createComponent(vnode)) {
        //如果是组件节点 

        return vnode.componentInstance.$el; //返回组件节点的真是DOM元素
      }

      vnode.el = document.createElement(tag); //利用标签创建元素   将元素放到虚拟节点的el上

      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child)); //将子节点变为元素的子节点
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el; //返回创建的真实节点
  }

  //patch函数实现
  function patch(oldVNode, newVNode) {
    //这里传入进来的oldVNode为app dom  进行的是初始渲染

    if (!oldVNode) {
      //若为组件节点      
      return createElm(newVNode); //创建组件节点的真实DOM并返回
    }

    var isRealEle = oldVNode.nodeType;
    if (isRealEle) {
      //如果是初始渲染  就通过vnode创建新的dom树
      var elm = oldVNode; //获取真实元素
      var parentNode = elm.parentNode; //拿到父元素
      var newElm = createElm(newVNode); //通过虚拟节点创建真实节点

      parentNode.insertBefore(newElm, elm.nextSibling); //将真是节点插入到页面中
      parentNode.removeChild(elm); //删除原来的节点

      return newElm; //返回新的真实dom节点
    } else {
      //这里则是两个虚拟节点  之间的比较   diff算法实现的地方
      //1.两个节点不是同一个节点    则直接删除原来节点 换上新的节点
      //2.两个虚拟节点是同一个节点   tag相同  key相同 再比较节点上的属性的差异 复用老的节点将差异属性更新
      if (!isSameNode(oldVNode, newVNode)) {
        //如果不是同一个节点  直接删除旧节点 创建新节点
        var el = createElm(newVNode);
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
    var el = newVNode.el = oldVNode.el; //复用旧节点  赋值给新节点

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
    var oldChildren = oldVNode.children ? oldVNode.children : [];
    var newChildren = newVNode.children ? newVNode.children : [];
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
    var oldStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newStartIndex = 0;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    //通过老节点 创建映射表
    function makeIndexByKey(arr) {
      var map = {};
      arr.forEach(function (child, index) {
        map[child.key] = index; //制作索引表 通过key
      });

      return map;
    }
    var map = makeIndexByKey(oldChildren);
    //从头开始  双方的头指针向后移动 为指针向头移动   双方都需要满足这个条件
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        continue;
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
        var moveIndex = map[newStartVnode.key];
        if (moveIndex != undefined) {
          //如果找到了老的节点
          var moveVNode = newChildren[moveIndex]; //拿到老的虚拟节点   进行复用
          el.insertBefore(moveVNode.el, oldStartVnode.el); //将该老的节点插入到头部
          oldChildren[moveIndex] = undefined; //表示这个节点已经挪走了
          patchVnode(moveVNode, newStartVnode);
        } else {
          //如果没有找到老的节点  就直接将新的虚拟节点创建为真实节点并插入到头部中
          var newChild = createElm(newStartVnode);
          el.insertBefore(newChild, oldStartVnode.el);
        }
        newStartVnode = newChildren[++newStartIndex]; //将新的children的头部指针往后移动
      }
    }
    //新的儿子节点数量比老的多   将新的儿子节点插入到dom上 要处理是插到之前 还是之后
    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);

        //处理是插入到尾巴 还是插入到头部
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
        //若anchor为空   则是向后追加
        el.insertBefore(childEl, anchor);
      }
    }
    //老的子节点多了 就要删除老的上面的节点
    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          //空节点不处理   只有有内容的节点 才处理
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }
  function mountChildren(el, newChildren) {
    //将新的虚拟节点中的儿子都挂载到真是DOM上
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._render = function () {
      //当渲染的时候会去实例取值 我们就可以将数据和视图绑定
      return this.$options.render.call(this);
    };
    Vue.prototype._update = function (vnode) {
      //核心所在   update方法
      //patch方法 既有初始化的功能 也有更新的功能
      var vm = this;
      var el = vm.$el;
      // vm.$el = patch(el, vnode); //将新的dom节点挂载到实例的$el属性上

      var preVnode = vm._vnode; //第一次渲染的时候没有vm._vnode
      vm._vnode = vnode; //将该虚拟节点保存在实例上  

      if (preVnode) {
        //如果存在虚拟node 说明之前已经渲染过了  
        vm.$el = patch(preVnode, vnode);
      } else {
        vm.$el = patch(el, vnode);
      }
    };
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) == "object") return JSON.stringify(value);
      return value;
    };
  }

  var strategy = {};
  var LIFECYCLE = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];
  LIFECYCLE.forEach(function (hook) {
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
  strategy.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);
    if (childVal) {
      for (var key in childVal) {
        res[key] = childVal[key];
      }
    }
    return res;
  };

  //合并options的功能
  function mergeOptions(parent, child) {
    var options = {}; //定义一个空options

    function mergeField(key) {
      //合并key值
      if (strategy[key]) {
        options[key] = strategy[key](parent[key], child[key]);
      } else {
        //如果不在策略中  以儿子为主
        options[key] = child[key] || parent[key];
      }
    }
    for (var key in parent) {
      //遍历父亲中的key
      mergeField(key); //将父亲和儿子都有的进行合并
    }

    for (var _key in child) {
      //遍历儿子
      if (!parent.hasOwnProperty(_key)) {
        //如果父亲上没有儿子的这个属性
        mergeField(_key); //将儿子的这个属性合并
      }
    }

    return options; //返回合并后的options
  }

  function callHook(vm, hook) {
    var handler = vm.$options[hook];
    if (handler) {
      handler.forEach(function (hook) {
        return hook.call(vm);
      });
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; //保留一下this

      //我们使用vue的时候  $nextTick   $data等等   表明是实例的变量
      vm.$options = mergeOptions(this.constructor.options, options);

      //初始化状态
      callHook(vm, "beforeCreate"); //钩子函数
      initState(vm); //初始化状态
      callHook(vm, "created");
      if (options.el) {
        vm.$mount(options.el);
      }
    }; //挂载$mount方法到原型上
    Vue.prototype.$mount = function (el) {
      var vm = this;
      if (el) {
        el = document.querySelector(el);
      }
      var ops = vm.$options;
      if (!ops.render) {
        //查看用户有没有写render函数
        var template;
        if (!ops.template && el) {
          //没有模板  但是有el  template就直接为el
          template = el.outerHTML;
        } else {
          if (ops.template) {
            //有模板  就直接用模板
            template = ops.template;
          }
        }
        //有了模板之后  对模板进行编译
        if (template) {
          var render = compileToFunction(template); //对模板进行编译  得到render函数
          ops.render = render; //将render函数绑定到ops上
        }
      }

      mountComponent(vm, el); // 挂载组件
    };
  }

  function initGlobalAPI(Vue) {
    //实现核心功能mixin
    Vue.options = {
      _base: Vue
    };
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };

    //实现extend方法  返回一个子类的构造方法
    Vue.extend = function (options) {
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this._init(options);
      } //面向切片编程  AOP
      Sub.prototype = Object.create(Vue.prototype); //将sub的原型对象变为Vue的prototype
      Sub.prototype.constructor = Sub; //再将原型对象的构造函数变为Sub
      Sub.options = mergeOptions(Vue.options, options); //需要将用户传入的options与全局options进行合并
      return Sub;
    };
    Vue.options.components = {}; //维护一个全局的components
    Vue.component = function (name, definition) {
      //实现component功能
      definition = typeof definition == "function" ? definition : Vue.extend(definition);
      Vue.options.components[name] = definition;
    };
  }

  function Vue(options) {
    this._init(options); //初始化 状态
  }

  initMixin(Vue); //初始化状态 合并options  初始化data computed watch  挂载$mount函数到原型上
  initLifeCycle(Vue); //初始化render和update函数  挂载到原型上
  initGlobalAPI(Vue); //初始化minxin
  initStateMixin(Vue); //初始化异步更新机制  $nextTick  和$watch方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
