const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'mirror.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /mode_modules/,
      },
      {
        test: /\.(vs|fs|glsl)(\?.*)?$/,
        use: ['raw-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  externals: /^three/,
  plugins: [new CleanWebpackPlugin()],
}
