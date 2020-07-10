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
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },{
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: [/node_modules/]
        },{
          test: /\.scss$/,
          use: ['style-loader', {
                  loader: 'css-loader',
                  options: {
                      modules: {
                          localIdentName:'[local]'
                      }
                  }
              }, 'sass-loader'],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ]
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFv',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map'
};
