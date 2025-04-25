import { transform } from "@swc/core";
// import addImportPlugin from "add-import-plugin";
import addImportPlugin from "../add_import_plugin.wasm";

export async function swcAddImport(source, { defalutImport, nameImport, path}) {
    const { code } = await transform(source, {
      jsc: {
        target: "esnext",
        parser: {
          syntax: "typescript",
          tsx: false,
        },
        experimental: {
          plugins: [
            [
              addImportPlugin(),
              {
                defalutImport,
                nameImport,
                path
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
swcAddImport(
  `    import { ElMessage } from 'element-plus'
import { useThrottleFn } from '@vueuse/core'
import useUser from '@/hooks/useUser'
import { useCart } from '@/store/useCart'
const router = useRouter()
const search = ref('')`,
  { defalutImport: "a", nameImport:["debounce","throttle"],path: "lodash" }
);

