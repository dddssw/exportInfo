import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

//defaultName
// 示例代码
const ast = parse(
  `
 const a='123'
export default a
`,
  { sourceType: "module" }
);
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
    let name = id ? declaration.id.name : "";
    let params = paramsNode.map((item) => item.name);
    //导出是函数
    if (type === "FunctionDeclaration") {
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
      };
    }
    //导出是变量
    else {
      return {
        name,
        comment,
        type,
      };
    }
  } else {
    const exportList = [];
    node.specifiers.forEach((specifier) => {
      if (specifier.type === "ExportSpecifier") {
        const variableName = specifier.local.name;

        // 查找与变量名匹配的 VariableDeclaration
        traverse.default(ast, {
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
                  });
                } else {
                  exportList.push({
                    name: variableName,
                    comment,
                    type,
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
    };
  } else if (declaration.type === "FunctionDeclaration") {
    const params = declaration.params.map((item) => item.name);
    const { returnData, returnType } = dealFunction(node.declaration.body.body);
    return {
      name: declaration.id.name,
      comment,
      params,
      type: declaration.type,
      returnData,
      returnType,
    };
  } else if (declaration.type === "Identifier") {
    const name = declaration.name;
    const exportData = [];
    traverse.default(ast, {
      VariableDeclaration(path) {
        path.get("declarations").forEach((declaration) => {
          if (declaration.node.id.name === name) {
            const initNode = declaration.node.init;
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
              });
            }else{
   exportData.push({
     name,
     comment,
     type: initNode.type,
   });
            }
          }
        });
      },
    });
    return exportData
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
        if (!~index) {
          //   vscode.window.showErrorMessage(`在 ${fileName}中出现语法错误`);
          throw new Error(`没有定义return的数据`);
        }
        const comment = dealComment(body[index]);
        const type = body[index].declarations[0].init.type;
        returnData.push({ returnName: key, comment, type });
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
  }
}
