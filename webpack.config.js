const path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;

module.exports = {

  entry: './src/_app.js',

  output: {
    path: path.join(__dirname, '/dist'),
    filename: `bundle${ process.env.NODE_ENV=='production' ? '.min' : '' }.js`,
    library: 'IRISScheduleViewer',
    libraryTarget: 'umd'
  },

  module: {

    rules: [
      {
        test: /\.js$/,
        include: [ path.resolve(__dirname, "src") ],
        use: [{
          loader: 'babel-loader' ,
          query: {
            presets: ['es2015'],
            plugins: ['transform-object-assign']
          }
        }],

      },
      {
        test: /\.less$/,
        include: [ path.resolve(__dirname, "src") ],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      }
    ]
  },

  devServer: {
    host:         process.env.HOSTNAME || "localhost",
    port:         process.env.PORT || 8080,
    contentBase:  path.join(__dirname, '/dist')
  },

  devtool: "source-map",

  plugins: [
    new HtmlWebpackPlugin({ template: "index.html", inject: "head" }),
    new ExtractTextPlugin(`style${ process.env.NODE_ENV=='production' ? '.min' : '' }.css`),
    new LicenseWebpackPlugin({ pattern: /.*/, unacceptablePattern: /GPL/, abortOnUnacceptableLicense: true, includePackagesWithoutLicense: true })
  ]

}
