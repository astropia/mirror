const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isProd = process.env.NODE_ENV !== 'development'

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/example.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: './dist',
    // https: true,
    host: '0.0.0.0',
  },
  devtool: isProd ? undefined : 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /mode_modules/,
      },
      {
        test: /\.(vs|fs|glsl)(\?.*)?$/,
        use: ['raw-loader'],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './dist',
            },
          },
          'css-loader',
          'stylus-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.mp3$/i,
        use: ['file-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(__dirname, 'public'), to: path.join(__dirname, 'dist') }],
    }),
    new MiniCssExtractPlugin({
      filename: isProd ? 'css/[name].[contenthash:8].css' : '[name].css',
      chunkFilename: isProd ? 'css/[name].[contenthash:8].chunk.css' : '[name].chunk.css',
    }),
  ],
}
