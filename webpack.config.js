const path = require('path');

module.exports = {
    mode: "development",
    entry: './src/RcsbFv/RcsbFv.tsx',
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
                      modules: true
                  }
              }, 'sass-loader'],
          exclude: /node_modules/
        },
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ]
    },
    output: {
        filename: 'RcsbFv.js',
        library: 'RcsbFv',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map'
};
