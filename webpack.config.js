var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'client/src/index.js'),
  output: {
    path: path.resolve(__dirname, 'client/assets/build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
          exclude: /node_modules/,
          loader: 'babel-loader?presets[]=es2015&presets[]=react'
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' } 
    ]
  },
  // plugins: [
  //   new webpack.DefinePlugin({ //<--key to reduce React's size
  //     'process.env': {
  //       'NODE_ENV': JSON.stringify('production')
  //     }
  //   }),
  //   new webpack.optimize.UglifyJsPlugin(),
  //   new webpack.optimize.AggressiveMergingPlugin(),
  //   new CompressionPlugin({
  //     asset: "[path].gz[query]",
  //     algorithm: "gzip",
  //     test: /\.js$|\.css$|\.html$/,
  //     threshold: 10240,
  //     minRatio: 0.8
  //   })
  // ],
  // node: {
  //   __dirname: true,
  // }
};