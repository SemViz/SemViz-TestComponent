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
    inject: false,
    template: 'src/testComponent/testComponent.html'
  })]
}, {
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
    inject: false,
    template: 'src/testComponentContainer/testComponentContainer.html',
  })]
}, {
  entry: {
    webComponentClass: './src/skosTreeSV/index.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public/skosTreeSV'),
    library: 'SkosTreeSV'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {}
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    inject: false,
    template: 'src/skosTreeSV/index.html',
  })]
},{
  entry: {
    webComponentClass: './src/semanticTableSV/index.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public/semanticTableSV'),
    library: 'SemanticTableSV'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {}
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    inject: false,
    template: 'src/semanticTableSV/index.html',
  })]
},{
  entry: {
    webComponentClass: './src/semanticFormSV/index.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public/semanticFormSV'),
    library: 'SemanticFormSV'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {}
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    inject: false,
    template: 'src/semanticFormSV/index.html',
  })]
}];
