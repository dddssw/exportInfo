import path from "path";

// Webpack 配置
const config = {
  entry: "./src/index.js", // 入口文件
  output: {
    filename: "bundle.js", // 输出文件名
    path: path.resolve(process.cwd(), "dist"), // 输出路径
    library: "exportInfo", // 导出的库名
    libraryTarget: "umd", // 支持多种模块格式
  },
  mode: "production", // 设置为生产模式
};

export default config; // 导出配置
