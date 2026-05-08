const path = require('path');

module.exports = {
    //mode: "development",
    mode: "production",
    entry: {
        'RcsbFv':'./src/RcsbFv.ts',
        'rcsb-saguaro':'./src/RcsbSaguaro.js'
    },
    module: {
      rules: [
          {
              test: /\.svg$/,
              issuer: /\.[jt]sx?$/,
              use: [{
                  loader:'@svgr/webpack',
                  options: {
                      expandProps: "end",
                      svgoConfig: {}
                  }
              }]
          },{
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },{
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },{
          test: /\.s?css$/,
          use: ['style-loader', {
              loader: 'css-loader',
              options: {
                  modules: {
                      localIdentName:'[local]'
                  }
              }
          }, {
              loader: 'sass-loader'
          }]
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ],
      fallback: {
          fs: false,
          buffer: false,
          crypto: false,
          path: false,
          stream: false
      }
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFv',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build')
    },
    devtool: 'source-map'
};
