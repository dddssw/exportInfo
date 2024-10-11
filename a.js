import { getExportInfo } from "./src/index.js";
import path from 'path';
// console.log(
//   AddImport(`
// import { parse,a,b } from "@babel/parser";
// `)
// );
const data = getExportInfo(
  `
    import { ref, onMounted } from 'vue';
 
function useFetch(request, params) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);
 
  onMounted(async () => {
    try {
      const {code, data: responseData} = await request(params||{});
      if(code === '0') {
        data.value = await responseData;
      }
    } catch (err) {
      error.value = err.msg;
    } finally {
      loading.value = false;
    }
  });
 
  return { data, error, loading };
}
 
export default useFetch;
    `
);
console.log(data)