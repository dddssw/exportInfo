import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export function getExportInfo(code, defaultName) {
const ast = parse(code, { sourceType: "module" });
const exportData = [];
traverse.default(ast, {
  ExportNamedDeclaration({ node }) {
    const data = dealNameExport(node);
    if (Array.isArray(data)) {
      exportData.push(...data);
    } else {
      exportData.push(data);
    }
  },
  ExportDefaultDeclaration({ node }) {
    const data = dealDefaultExport(node);
    exportData.push(data);
  },
});
function dealComment(node) {
  let comments = "";
  if (node.leadingComments) {
    comments = node.leadingComments.map((item) => item.value.trim()).join("\n");
  }
  return comments;
}
function dealNameExport(node) {
  const comment = dealComment(node);
  const { declaration } = node;
  if (declaration) {
    const { params: paramsNode, id, type } = declaration;
    //导出是函数
    if (type === "FunctionDeclaration") {
      const name = id ? declaration.id.name : "";
      let params = paramsNode.map((item) => item.name);
      const { returnData, returnType } = dealFunction(
        node.declaration.body.body
      );
      return {
        name,
        comment,
        params,
        type,
        returnData,
        returnType,
        loc: node.loc,
      };
    }
    //导出是变量
    else {
      const name = declaration.declarations[0].id.name;
      return {
        name,
        comment,
        type,
        loc: node.loc,
      };
    }
  } else {
    const exportList = [];
    node.specifiers.forEach((specifier) => {
      if (specifier.type === "ExportSpecifier") {
        const variableName = specifier.local.name;

        // 查找与变量名匹配的 VariableDeclaration
        traverse.default(ast, {
          FunctionDeclaration({ node }) {
            if (node.id?.name === variableName) {
              const { returnData, returnType } = dealFunction(node.body.body);
              const params = node.params.map((item) => item.name);
              const comment = dealComment(node);
              exportData.push({
                name: variableName,
                comment,
                params,
                type: node.type,
                returnData,
                returnType,
                loc: node.loc,
              });
            }
          },
          VariableDeclaration({ node }) {
            node.declarations.forEach((declaration) => {
              if (declaration.id.name === variableName) {
                const type = declaration.init.type;
                const comment = dealComment(node); // 获取注释
                if (type.includes("Function")) {
                  let params = declaration.init.params.map((item) => item.name);
                  const { returnData, returnType } = dealFunction(
                    declaration.init.body.body
                  );
                  exportList.push({
                    name: variableName,
                    comment,
                    params,
                    type,
                    returnData,
                    returnType,
                    loc: node.loc,
                  });
                } else {
                  exportList.push({
                    name: variableName,
                    comment,
                    type,
                    loc: node.loc,
                  });
                }
              }
            });
          },
        });
      }
    });
    return exportList;
  }
}
function dealDefaultExport(node) {
  const comment = dealComment(node);
  const { declaration } = node;  
  if (declaration.left) {
    return {
      name: declaration.left.name,
      comment,
      type: declaration.type,
      loc: declaration.loc,
    };
  } else if (
    declaration.type === "FunctionDeclaration" ||
    declaration.type === "ArrowFunctionExpression"
  ) {
    const params = declaration.params.map((item) => item.name);
    const { returnData, returnType } = dealFunction(node.declaration.body.body);
    return {
      name: declaration.id?.name ?? defaultName,
      comment,
      params,
      type: declaration.type,
      returnData,
      returnType,
      loc: declaration.loc,
    };
  } else if (declaration.type === "Identifier") {
    const name = declaration.name;
    const exportData = [];
    traverse.default(ast, {
      FunctionDeclaration({ node }) {
        if (node.id?.name === name) {
          const { returnData, returnType } = dealFunction(node.body.body);
          const params = node.params.map((item) => item.name);
          const comment = dealComment(node);
          exportData.push({
            name,
            comment,
            params,
            type: node.type,
            returnData,
            returnType,
            loc: node.loc,
          });
        }
      },
      VariableDeclaration({ node }) {
        node.declarations.forEach((declaration) => {
          if (declaration.id.name === name) {
            const comment = dealComment(node);
            const initNode = declaration.init;
            // 确保初始化节点是一个函数
            if (
              initNode &&
              (initNode.type === "FunctionDeclaration" ||
                initNode.type === "FunctionExpression")
            ) {
              const params = initNode.params.map((item) => item.name);
              const { returnData, returnType } = dealFunction(
                initNode.body.body
              );
              exportData.push({
                name: initNode.id.name,
                comment,
                params,
                type: initNode.type,
                returnData,
                returnType,
                loc: node.loc,
              });
            } else {
              exportData.push({
                name,
                comment,
                type: initNode.type,
                loc: node.loc,
              });
            }
          }
        });
      },
    });
    return exportData;
  }else{
        return {
          name: defaultName,
          comment,
          type: declaration.type,
          loc: declaration.loc,
        };
  }
}
function dealFunction(body) {
  const index = body.findIndex((item) => item.type === "ReturnStatement");
  let returnData = [];
  let returnType = "";
  if (~index) {
    const returnNode = body[index];

    const { argument } = returnNode;
    //return返回的是对象
    if (argument.type === "ObjectExpression") {
      returnType = "ObjectExpression";
      const { properties } = argument;
      properties.forEach((item) => {
        const key = item.key.name;
        const value = item.value.name;

        const index = body.findIndex((returnBody) => {
          if (returnBody.declarations) {
            return returnBody.declarations[0].id.name === value;
          }
        });
        //return 的东西没有找到对应节点
        if (~index) {
          const comment = dealComment(body[index]);
          const type = body[index].declarations[0].init.type;
          returnData.push({ returnName: key, comment, type });
        } else {
          returnData.push({ returnName: key, comment: "", type: "Not Found" });
        }
      });
    } else {
      returnType = "NormalExpression";
      const index = body.findIndex((returnBody) => {
        if (returnBody.declarations) {
          return returnBody.declarations[0].id.name === argument.name;
        }
      });
      if (!~index) {
        //   vscode.window.showErrorMessage(`在 ${fileName}中出现语法错误`);
        throw new Error(`在 ${fileName}中出现语法错误`);
      }
      const comment = dealComment(body[index]);
      returnData.push({ returnName: argument.name, comment });
    }
    return { returnData, returnType };
  } else {
    return { returnData, returnType: "noReturn" };
  }
}
return exportData
}

//  function a() {}
//  const b = "123";
//  const c = () => {};
//  const d = function foo() {};
//  export { a, b, c, d };

// 示例代码
