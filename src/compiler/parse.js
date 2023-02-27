const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配到的是一个标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配到的是结束的标签名
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性
const startTagClose = /^\s*(\/?)>/;


//从template中解析标签  解析一段就删一段
//parseHTML生成一棵AST  对html一段一段解析 删除  利用正则匹配
//生成一棵AST树   利用栈维护     =>字符串拼接 很恶心  返回一棵树
export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; //用于存放元素
  let currentParent; //指针  指向栈中的最后一个
  let root

  function creatASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  function start(tag, attrs) {
    let node = creatASTElement(tag,attrs)  //得到节点
    if(!root){   //判断是否为根节点
      root = node
    }
    if(currentParent){
      node.parent = currentParent   //设置当前节点的父节点
      currentParent.children.push(node)
    }
    stack.push(node)   //将节点存入栈中
    currentParent = node   //将父节点指向栈中最后一个节点
    
  }
  function chars(text) {
    text = text.replace(/\s/g,"")
    text && currentParent.children.push({
      type:TEXT_TYPE,
      text,
      parent:currentParent
    })

  }
  function end(tag) {
    stack.pop()//弹出最后一个  
    currentParent = stack[stack.length-1]
  }

  function parseStart() {
    //处理开始标签
    const start = html.match(startTagOpen); //匹配开始标签
    if (start) {
      const match = {
        //构建一个对象
        tag: start[1],
        attrs: [],
      };

      advance(start[0].length); //匹配到开始标签后 一直匹配下去  直到开始标签的结束

      let attr, end;
      while (
        //不是结束标签  将属性一直匹配来 并且将属性
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        //一直匹配下去

        advance(attr[0].length); //继续删除匹配到的属性
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        }); //将匹配到的attr加入
      }
      if (end) {
        //如果匹配到了开始标签的结束标签  就删掉
        advance(end[0].length);
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
    let text_end = html.indexOf("<"); //匹配<开始
    if (text_end == 0) {
      //若为0  表示为标签的开始
      const startTagMatch = parseStart(); //开始标签的匹配结果
      if (startTagMatch) {
        //如果匹配到的仍是开始标签
        start(startTagMatch.tag, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (text_end > 0) {
      //若大于0 则表示为文本
      let text = html.substring(0, text_end);
      if (text.length > 0) {
        advance(text.length); //将文本删除即可
        chars(text);
      }
    }
  }
  return root
}