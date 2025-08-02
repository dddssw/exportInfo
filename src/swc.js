import { transform } from "@swc/core";

export async function swcAddImport(source, { default_import, name_import, path }) {
  const { code } = await transform(source, {
    jsc: {
      target: "esnext",
      parser: {
        syntax: "ecmascript",
        tsx: false,
        keepImportAssertions: true,
        keepImports: true,
      },
      experimental: {
        plugins: [
          [
            "add-import-plugin",
            {
              default_import,
              name_import,
              path,
            },
          ],
        ],
      },
      preserveAllComments: true,
    },
    isModule: true,
  });
  console.log(code);
}
// usage
// swcAddImport(
//   `    import { ElMessage } from 'element-plus'
// import { useThrottleFn } from '@vueuse/core'
// import useUser from '@/hooks/useUser'
// import { useCart } from '@/store/useCart'
// import type {a} from 'oo'
// const router = useRouter()
// const search = ref('123')
// function sum(a:number){
  
// }
// `,

//   { default_import: "a", name_import: ["debounce", "throttle"], path: "lodash" }
// );

