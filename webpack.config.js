const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
  entry: {
    front: './src/testComponent/external.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public/testComponent')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: [new HtmlWebpackPlugin({
    template: 'src/testComponent/testComponent.html'
  })]
},{
  entry: {
    front: './src/testComponentContainer/external.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public/testComponentContainer')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: [new HtmlWebpackPlugin({
    inject : false,
    template: 'src/testComponentContainer/testComponentContainer.html',
  })]
}];
