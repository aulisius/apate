const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { getIfUtils, removeEmpty } = require("webpack-config-utils");
const project = require("./webpack/project");

module.exports = (env = { production: false }) => {
  const { ifProduction, ifNotProduction } = getIfUtils(env, ["production"]);
  const extractStyles = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    allChunks: true,
    disable: ifNotProduction()
  });

  const publicPath = "/";
  // ifNotProduction(`http://0.0.0.0:3000/`, "/");

  return {
    context: project.src(),
    entry: {
      app: removeEmpty([
        project.src("main.js"),
        ifNotProduction(`webpack-dev-server/client?${publicPath}`)
      ])
    },
    target: "web",
    output: {
      filename: `[name].[hash].js`,
      chunkFilename: `[name].[hash].js`,
      path: project.dist("output"),
      publicPath
    },
    devtool: ifNotProduction("source-map", false),
    resolve: {
      alias: {
        constants: project.src("constants")
      },
      modules: [project.src(), "node_modules"]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: project.src(),
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: ifNotProduction()
            }
          }
        },
        {
          test: /\.(png|jpe?g|svg|woff|woff2)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192,
                name: "[path][name].[ext]",
                outputPath: "assets/"
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader"
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: ifNotProduction(),
                minimize: ifProduction()
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          loader: extractStyles.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  sourceMap: ifNotProduction(),
                  minimize: ifProduction()
                }
              },
              {
                loader: "sass-loader",
                options: {
                  includePaths: [project.src()]
                }
              }
            ]
          })
        }
      ]
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify(ifProduction("production", "development"))
        }
      }),
      new HtmlWebpackPlugin({
        template: project.public("index.html"),
        hash: false,
        inject: "body",
        minify: {
          collapseWhitespace: true
        }
      }),
      new CleanWebpackPlugin(["output"], {
        root: project.dist()
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: "manifest",
        filename: "manifest.js",
        minChunks: Infinity
      }),
      extractStyles,
      new webpack.optimize.AggressiveMergingPlugin()
    ]),
    devServer: {
      port: 3000,
      host: "0.0.0.0",
      compress: true,
      clientLogLevel: "error",
      overlay: true,
      watchContentBase: true,
      publicPath,
      disableHostCheck: true,
      contentBase: project.src(),
      historyApiFallback: {
        disableDotRule: true
      },
      stats: "errors-only",
      proxy: {
        "/api": {
          target: "http://192.168.14.182:5000",
          pathRewrite: { "^/api": "" }
        }
      },
      quiet: false,
      noInfo: false,
      lazy: false
    }
  };
};
