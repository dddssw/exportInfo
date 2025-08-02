import { transformSync } from "@babel/core";
import plugin from "./babel-plugin-add-import";
import { path } from "@babel/traverse/lib/cache";

const normalizeCode = (code) =>
  code
    .replace(/\s+/g, " ") // 合并连续空格
    .replace(/,\s+/g, ", ") // 标准化逗号空格
    .replace(/; /g, ";") // 移除分号后空格
    .trim();

const testTransform = (input, config) => {
  const result = transformSync(input, {
    plugins: [[plugin, config]],
    configFile: false,
  });

  return normalizeCode(result.code);
};

describe("transform-merge-imports", () => {
  const baseConfig = {
    path: "lodash",
    defaultImport: "a",
    nameImport: ["throttle", "debounce", "deepClone"],
  };

  test("merge existing imports with default and named", () => {
    const input = `
      import  { deepClone, isEqual } from 'lodash';
      import b, { isSame } from 'lodash';
    `;
    const expected = `
      import b, { deepClone, isEqual, isSame, throttle, debounce } from 'lodash';
    `;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  });

  test("handle imports with aliases", () => {
    const input = `
      import a, { deepClone, isEqual } from 'lodash';
      import { isEqual as iE } from 'lodash';
    `;
    const expected = `
      import a, { deepClone, isEqual, isEqual as iE, throttle, debounce } from 'lodash';
    `;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  });

  test("preserve existing aliases and add new imports", () => {
    const input = `
      import { deepClone as dC, isEqual } from 'lodash';
      import  { isEqual as iE } from 'lodash';
    `;
    const expected = `
      import a, { deepClone as dC, isEqual, isEqual as iE, throttle, debounce } from 'lodash';
    `;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  });

  test("add default import when missing", () => {
    const input = `import { isEqual } from 'lodash';`;
    const expected = `import a, { isEqual } from 'lodash';`;

    expect(testTransform(input, {
    path: "lodash",
    defaultImport: "a",
  })).toBe(normalizeCode(expected));
  });

  test("insert new import after last existing import", () => {
    const input = `
      import { ElMessage } from 'element-plus';
      import { useThrottleFn } from '@vueuse/core';
      const test = 1;
    `;
    const expected = `
      import { ElMessage } from 'element-plus';
      import { useThrottleFn } from '@vueuse/core';
      import a, { throttle, debounce, deepClone } from 'lodash';
      const test = 1;
    `;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  });

  test("handle empty nameImport configuration", () => {
    const input = `import { isEqual } from 'lodash';`;
    const config = {
      path: "lodash",
      defaultImport: "a",
      nameImport: [],
    };
    const expected = `import a, { isEqual } from 'lodash';`;

    expect(testTransform(input, config)).toBe(normalizeCode(expected));
  });

  test("insert at top when no imports exist", () => {
    const input = `const test = 1;`;
    const expected = `
      import a, { throttle, debounce, deepClone } from 'lodash';
      const test = 1;
    `;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  })
  test("create new", () => {
    const input = ``;
    const expected = `
      import a, { throttle, debounce, deepClone } from 'lodash';`;

    expect(testTransform(input, baseConfig)).toBe(normalizeCode(expected));
  })
  test("merge", () => {
    const input = ` import a, { throttle, debounce, deepClone } from 'lodash';`;
    const expected = `
      import a, { throttle, debounce, deepClone } from 'lodash';`;

    expect(
      testTransform(input, {
        path: "lodash",
        defaultImport: "",
        nameImport: ["throttle"],
      })
    ).toBe(normalizeCode(expected));
  })
});
