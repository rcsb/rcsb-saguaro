const path = require('path');

module.exports = {
    //mode: "development",
    mode: "production",
    entry: {
        'rcsb-saguaro':'./src/RcsbSaguaro.js'
    },
    module: {
      rules: [
        {
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
              loader: 'resolve-url-loader'
          }, {
              loader: 'sass-loader',
              options: {
                  sourceMap: true
              }
          }]
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ],
      fallback: {
          fs: false,
          buffer: require.resolve('buffer'),
          crypto: require.resolve('crypto-browserify'),
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify')
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
