module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 添加 fallback 配置来解决 axios 的 http 模块问题
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "http": false,
        "https": false,
        "http2": false,
        "zlib": false,
        "stream": false,
        "buffer": false,
        "url": false,
        "util": false,
        "assert": false,
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "process": false
      };
      
      // 确保只使用浏览器适配器
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        './adapters/http.js': './helpers/null.js',
        './platform/node/index.js': './platform/browser/index.js'
      };
      
      return webpackConfig;
    }
  }
};