set({}, "a.b.c", 123); // 输出{a:{b:{c:123}}}

set({ e: 1 }, "a.b.c.d", 123); // 输出{e:1, a:{b:{c:{d:123}}}}

function set(obj,keys,value){
const paths = keys.split(',')

function dfs(obj,index){
   if(index===paths.length-1){
    obj[paths[index]]=value;
    return obj
   } 
   obj[paths[index]]=dfs(obj,index+1)
   return obj
}
const res = dfs({},0)
return obj.assign(res)
}