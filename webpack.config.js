import path from "path";

// Webpack 配置
const config = {
  entry: "./src/index.js", // 入口文件
  output: {
    filename: "bundle.js", // 输出文件名
    path: path.resolve(process.cwd(), "dist"), // 输出路径
    libraryTarget: "module", // 这是对ESM输出的关键配置
    globalObject: "this",
  },
  experiments: {
    outputModule: true, // 允许输出作为ESM
  },
module: {
    rules: [
      {
        test: /\.js$/,  // 适配.js文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']  // 适用于将现代JavaScript编译成更广泛兼容的格式
          }
        }
      }
    ]
  },
  mode: "development", // 设置为生产模式
};

export default config; // 导出配置
