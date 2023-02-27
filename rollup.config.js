//rollup 可以默认导出一个对象  作为打包的配置
import babel from 'rollup-plugin-babel'

export default{
    input:"./src/index.js",  //入口
    output:{
        file:"./dist/vue.js",  //出口
        name:"Vue",   //在全局上增添一个Vue
        format:"umd" ,  //esm  es6   commonjs模块  iife自执行函数
        sourcemap:true    //可以调试源代码  
    },
    plugins:[
        babel({
            exclude:'node_modules/**'   //排除node_modules下的所有文件夹
        })
    ]
}