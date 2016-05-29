'use strict';
var webpack = require('webpack');
var _ = require('lodash');
var args = require('minimist')(process.argv.slice(2));

// Set the correct environment
var env;
if(args._.length > 0 && args._.indexOf('start') !== -1) {
  env = 'test';
} else if (args.env) {
  env = args.env;
} else {
  env = 'dev';
}
process.env.REACT_WEBPACK_ENV = env;

var webModulePath = __dirname + '/src/web/';

var baseConfig = {
  entry: webModulePath + 'components/app.js',
  output: {
    path: webModulePath + 'resources/js',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', query: {presets: ['react', 'es2015', 'stage-0']}},
    ]
  }
};

var config = baseConfig;
if (env == 'dist'){
  config = _.merge({
    cache: false,
    devtool: 'sourcemap',
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  }, baseConfig);
}

module.exports = config;
