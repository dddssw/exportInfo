import {getExportInfo} from './src/index.js'
console.log(
  getExportInfo(`
import { ref, onMounted, onUnmounted } from 'vue'

export function register(
  selector: string,
  multiple: boolean = false,
  parent?: Element
): Element | NodeList | null {
  const parentElement = parent ?? document
  const domReference = multiple
    ? parentElement.querySelectorAll(selector)
    : parentElement.querySelector(selector)
  return domReference
}

`)
);