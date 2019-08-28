const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
    mode: "development",
    entry: './src/RcsbBoard/scss/tnt.scss',
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                exclude: /node_modules/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            name: 'dist/rcsb.board.css',
                            sourceMap: false
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'rcsb.board.css',
            chunkFilename: '[id].css'
        })
    ]
};
