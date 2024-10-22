import { getExportInfo } from "./src/index.js";
import path from 'path';
// console.log(
//   AddImport(`
// import { parse,a,b } from "@babel/parser";
// `)
// );
const data = getExportInfo(
  `
import { type LocationQueryRaw, useRoute, useRouter } from 'vue-router'
import { useCommonStore } from '@/store/common'
import { useTabsStore } from '@/store/tabs'

const useNavigate = () => {
  const router = useRouter()
  const route = useRoute()
  const { updateRefreshKey } = useCommonStore()
  const { tabs, setTabsList, setTabsActive } = useTabsStore()

  // 跳转并刷新指定页面
  const jumpRefreshOfState = (path: string, state = {}) => {
    updateRefreshKey(path)
    router.push({ path, state })
  }
  // 跳转并刷新指定页面
  const jumpRefresh = (path: string, query?: LocationQueryRaw) => {
    updateRefreshKey(path)
    router.push({ path, query })
  }

  // 关闭当前页面（清除当前页面缓存），并跳转到指定页面
  const closeJump = (path: string, query?: LocationQueryRaw) => {
    const fromItem = tabs.list.find((item) => item.name === route.name)
    if (fromItem) {
      updateRefreshKey(fromItem.fullPath)
    }
    const arr = tabs.list.filter((item) => item.fullPath !== route.fullPath)
    setTabsList([...arr])
    // const jumpRoute = router.getRoutes().find(item=>item.path===path)
    // setTabsActive(jumpRoute?.name)
    router.push({ path, query })
  }

  // 关闭当前页面（清除当前页面缓存），跳转并刷新指定页面，如果没有指定页面，则跳转到上一个页面
  const closeJumpRefresh = (path?: string, query?: LocationQueryRaw) => {
    let lostPath = ''
    if (tabs.list.length >= 2) {
      lostPath = tabs.list[tabs.list.length - 2]?.fullPath
    }
    const jumpPath = path || lostPath

    jumpPath &&
      (() => {
        updateRefreshKey(jumpPath)
        closeJump(jumpPath, query)
      })()
  }

  return {
    jumpRefreshOfState,
    jumpRefresh,
    closeJump,
    closeJumpRefresh
  }
}

export default useNavigate


    `
);
console.log(data)