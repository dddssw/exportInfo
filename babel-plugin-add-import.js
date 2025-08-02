import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

const mergeSpecifiers = (targetImports, config) => {
  const mergedSpecifiers = [];
  const namedSpecifiers = new Map();
  let existingDefault;

  // // 强制使用配置的默认导入
  // if (config.defaultImport) {
  //   mergedSpecifiers.push(
  //     t.importDefaultSpecifier(t.identifier(config.defaultImport))
  //   );
  // }
  // 收集已有默认导入
  targetImports.forEach((imp) => {
    imp.get("specifiers").forEach((spec) => {
      const node = spec.node;
      if (t.isImportDefaultSpecifier(node)) {
        existingDefault = node;
      }
    });
  });

  // 处理默认导入
  if (existingDefault) {
    mergedSpecifiers.push(existingDefault);
  } else if (config.defaultImport) {
    mergedSpecifiers.push(
      t.importDefaultSpecifier(t.identifier(config.defaultImport))
    );
  }
  // 收集所有具名导入
  targetImports.forEach((imp) => {
    imp.get("specifiers").forEach((spec) => {
      const node = spec.node;
      if (t.isImportSpecifier(node)) {
        const key = node.imported
          ? `${node.imported.name}::${node.local.name}`
          : node.local.name;

        if (!namedSpecifiers.has(key)) {
          namedSpecifiers.set(key, node);
        }
      }
    });
  });

  // 添加新导入
  config.nameImport.forEach((name) => {
    const exists = Array.from(namedSpecifiers.values()).some(
      (node) => (node.imported?.name || node.local.name) === name
    );

    if (!exists) {
      const newSpec = t.importSpecifier(t.identifier(name), t.identifier(name));
      namedSpecifiers.set(`${name}::${name}`, newSpec);
    }
  });

  mergedSpecifiers.push(...Array.from(namedSpecifiers.values()));

  return mergedSpecifiers;
};

export default declare((api, options) => {
  api.assertVersion(7);

  const config = {
    defaultImport: options.defaultImport || "",
    nameImport: options.nameImport || [],
    path: options.path || "",
  };

  return {
    name: "transform-merge-imports",
    visitor: {
      Program: {
        exit(path) {
          const targetPath = config.path;
          if (!targetPath) return;

          const targetImports = path
            .get("body")
            .filter(
              (p) =>
                p.isImportDeclaration() && p.node.source.value === targetPath
            );

          if (targetImports.length > 0) {
            const merged = mergeSpecifiers(targetImports, config);
            const newImport = t.importDeclaration(
              merged,
              createSourceNode(targetPath)
            );

            // 替换旧导入
            targetImports.forEach((imp) => imp.remove());
            path.unshiftContainer("body", newImport);
          } else {
            const specifiers = [];

            if (config.defaultImport) {
              specifiers.push(
                t.importDefaultSpecifier(t.identifier(config.defaultImport))
              );
            }

            config.nameImport.forEach((name) => {
              specifiers.push(
                t.importSpecifier(t.identifier(name), t.identifier(name))
              );
            });

            if (specifiers.length > 0) {
              const newImport = t.importDeclaration(
                specifiers,
                createSourceNode(targetPath)
              );

              const lastImport = path
                .get("body")
                .filter((p) => p.isImportDeclaration())
                .pop();

              if (lastImport) {
                lastImport.insertAfter(newImport);
              } else {
                path.unshiftContainer("body", newImport);
              }
            }
          }
        },
      },
    },
  };
});
// 创建带明确引号格式的字符串节点
const createSourceNode = (value) => {
  const node = t.stringLiteral(value);
  node.extra = { 
    rawValue: value, 
    raw: `'${value}'` // 强制使用单引号
  };
  return node;
};
