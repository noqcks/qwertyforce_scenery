/* eslint-disable @typescript-eslint/no-var-requires */
require('sharp') //https://github.com/lovell/sharp/issues/2655#issuecomment-815684743
// const zlib = require("zlib")
// const CompressionPlugin = require("compression-webpack-plugin")
// const use_brotli = false
module.exports = {
  poweredByHeader: false,
  compress: false,
  // typescript: {ignoreBuildErrors: true},
  optimizeFonts: false, //fix flickering font
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/last_added/1'
      }
    ]
  },
  env: {  //https://nextjs.org/docs/api-reference/next.config.js/environment-variables
    recaptcha_site_key: "6LcqV9QUAAAAAEybBVr0FWnUnFQmOVxGoQ_Muhtb",
    api_domain: "http://localhost/public_api", //for links
    domain: "http://localhost",  //for links
    ipns: "ipns.scenery.cx" //example, put your own domain here
  },
  distDir: '_next'
}

// ,   Doesn't work for some reason
//   webpack: (config, { isServer }) => {
//     if (use_brotli && !isServer) {
//       config.plugins.push(
//         new CompressionPlugin({
//           filename: "[path][base].br",
//           algorithm: "brotliCompress",
//           test: /\.(js|css|html)$/,
//           compressionOptions: {
//             params: {
//               [zlib.constants.BROTLI_PARAM_QUALITY]: 1,
//             },
//           }
//         })
//       )
//     }
//     return config
//   },