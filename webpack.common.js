const path = require("path");
const fs = require("fs");
const PugPlugin = require('pug-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Dynamically get all templates for pages
const PAGES_DIR = path.join(__dirname, "src", "pages");
const pages = fs.readdirSync(PAGES_DIR);
const entry = pages.reduce((acc, pageName) => {
  acc[pageName.toLowerCase()] = path.join(PAGES_DIR, pageName, `${pageName.toLowerCase()}.pug`);
  return acc;
}, {});

const config = {
  entry: entry,

  output: {
    path: path.join(__dirname, "dist"),
    filename: 'assets/js/[name].[contenthash:8].js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]'
        }
      },
      {
        test: /\.pug$/i,
        loader: PugPlugin.loader,
      },
    ],
  },

  plugins: [
    // Generating html pages based on pug templates as entry points for Webpack
    new PugPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css'
      }
    }),

    // Copy robots.txt file from src to dist
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "robots.txt"),
          to: path.resolve(__dirname, "dist", "robots.txt"),
        },
        {
          from: path.resolve(__dirname, "./src/favicons/"),
          to: path.resolve(__dirname, "dist"),
        }
      ],
    }),
  ],
};

module.exports = config;