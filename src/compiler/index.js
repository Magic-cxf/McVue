import { parseHTML } from "./parse";
/*
 * <div>
        <div></div>
        <span></span>
    </div>
 * 
 */
function genProps(attrs){
  let str = ''
  for(let i = 0; i<attrs.length;i++){
    let attr = attrs[i]
    if(attr.name === "style"){
      let obj = {}
      attr.value.split(";").forEach(item=>{
        let [key,value] = item.split(":")
        obj[key] = value
      })
      attr.value = obj
    }
    str +=`${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}`
}

const defaultTagRE =/\{\{((?:.|\r?\n)+?)\}\}/g  //匹配{{}}中间的表达式  一定要去掉修饰符g
function gen(node){
  if(node.type == 1){   //如果是元素节点  直接调用codegen
    return codegen(node)
  }else{   //如果是文本节点
    defaultTagRE.lastIndex = 0   //将正则匹配的开始位置置0
    if(!defaultTagRE.test(node.text)){
      return `_v(${JSON.stringify(node.text)})`
    }else{
      defaultTagRE.lastIndex = 0  //将正则的lastindenx 置为0
      let text = node.text  //拿到文本内容 
      let res       //定义匹配的结果
      let startindex,endindex
      startindex = 0
      let result = []   //用数组维护 获得的结果   _s(name)+_v(text)+_(age)
      while(res = defaultTagRE.exec(text)){   //通过正则匹配{{}}中间的内容
        endindex = res.index
        if(endindex > startindex){
          result.push(`"${text.slice(startindex,endindex)}"`)
        }
        result.push(`_s(${res[1]})`)
        startindex = endindex+res[0].length
      }
      if(startindex < text.length){   //判断是否还有文本内容  
        result.push(`"${text.slice(startindex,text.length)}"`)
      }
      return `_v(${result.join("+")})`  //返回格式  _v(_s(name)+"xx"+_s(age))
    }
  }
}

function genChildren(children){
  if(children){
    return children.map(child=>gen(child)).join(',')
  }
}
function codegen(ast){
  let children = genChildren(ast.children)

  let code = `_c("${ast.tag}",    
  ${ast.attrs.length>0?genProps(ast.attrs):'null'}   
  ${ast.children.length>0?`,${children}`:""}    
  )`
  return code
}


export function compileToFunction(template) {
  //1.第一步 生成AST语法树
  //2.第二步  将抽象语法树转换为render函数   render函数返回的结果就是虚拟DOM

  let ast = parseHTML(template); //生成AST语法树
  let code = `with(this){return ${codegen(ast)}}`   //render函数的实现   
  const render = new Function(code)    //模板引擎的原理     利用with 和 new Function 
  return render
}
