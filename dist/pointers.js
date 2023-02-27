let str = "abd fjb   dji d  "

//利用快慢指针  将str以空格分割

const result = []
let firstPointer = 0
let secondPointer = 0

//快慢指针进行分割
for( let i =0; i< str.length;i++){
    if(str[firstPointer] ==" "){
        if(str[secondPointer] !=" "){
            result.push(str.substring(secondPointer,firstPointer))
            secondPointer = firstPointer+1

        }else{
            secondPointer++
        }
    }
    if( firstPointer== str.length-1 && secondPointer <= firstPointer){
        result.push(str.substring(secondPointer))
    }
    firstPointer++
    console.log(firstPointer,secondPointer)
}
console.log(result)

