import {getExportInfo} from './src/index.js'
console.log(
  getExportInfo(`


import { ref, onMounted, onUnmounted } from "vue";

// 自定义 Hook 用于获取窗口大小
  function useWindowSize(a,b) {
  // 定义响应式的宽度和高度const {width,height} = useWindowSize()
  
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  // 处理窗口大小变化的回调函数
  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  // 在组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });

  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  return {
    width,
    height,
  };
}
export  {useWindowSize};
// 自定义 Hook 用于获取窗口大小
 export default function a (c,d) {
  // 定义响应式的宽度和高度
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  // 处理窗口大小变化的回调函数
  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  // 在组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });

  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  return width;
}
 export  const data='';




`)
);