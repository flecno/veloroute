const path = require("path");
const fs = require('fs');
const yaml = require('js-yaml');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const WebpackCdnPlugin = require('webpack-cdn-plugin');

const routes = require('./routes.json');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const htmlOpts = {
    template: "main.html",
    minify: !isProduction ? false : {
      collapseWhitespace: true,
      removeComments: true
    },
    excludeChunks: [ 'polyfillLoader' ],
    hash: false
  }
  pages = [
    new HtmlWebpackPlugin({...htmlOpts, title: "veloroute.hamburg – Fahrradwege für den Alltag"}),
    new HtmlWebpackPlugin({...htmlOpts, title: "veloroute.hamburg – Qualität und Ausbaustatus", filename: "quality.html"}),
    new HtmlWebpackPlugin({...htmlOpts, title: "veloroute.hamburg – Hintergrund und Helfen", filename: "projekt.html"}),
    new HtmlWebpackPlugin({...htmlOpts, title: "veloroute.hamburg – Letzte Änderungen", filename: "changes.html"}),
    new HtmlWebpackPlugin({...htmlOpts, title: "veloroute.hamburg – Baustellen und geplante Maßnahmen auf Fahrradwegen", filename: "bau.html"})
  ];
  let sitemapURLs = [];
  for(let i = 1; i <= 14; i++) {
    const reviewDate = routes[i+'']["review_date"];
    pages.push(new HtmlWebpackPlugin({...htmlOpts, reviewDate: reviewDate, title: `veloroute.hamburg – Alltagsroute ${i}`, filename: `${i}.html`}));
    sitemapURLs.push({path: `/routes/geo/route${i}.gpx`, priority: 0.1});
    sitemapURLs.push({path: `/routes/geo/route${i}.kml`, priority: 0.1});
  }


  fs.readdirSync("blog/").forEach(file => {
    let date = file.substr(0, 10);
    let fn = file.replace(/\.yaml$/, '')
    let doc = yaml.safeLoad(fs.readFileSync('blog/' + file, 'utf8'));
    pages.push(new HtmlWebpackPlugin({
      ...htmlOpts,
      lastCheck: date,
      title: `veloroute.hamburg – ${doc.title}`,
      filename: `blog/${fn}.html`
    }));
  });

  sitemapURLs = sitemapURLs.concat(pages.map(p => {
    const subHeadlines = (p.options.title.match(/–/g) || []).length;
    let path = p.options.filename.replace(/\.html$/, '');
    if(path === 'index') path = '';
    return {
      path: '/' + path,
      priority: Math.max(1 - subHeadlines*0.2, 0),
      lastMod: p.options.reviewDate || p.options.lastCheck
    }
  }));

  return {
    devtool: "source-map",
    mode: "development",
    entry: {
      polyfillChecker: "./src/polyfill-checker.js",
      polyfillLoader: "./src/polyfill-loader.js",
      checkWebGL: "./src/checkWebGL.js",
      app: "./src/index.js"
    },
    output: {
      path: path.resolve(__dirname),
      chunkFilename: "chunk.[name].[contenthash].ch.js",
      filename: "bundle.[name].[contenthash].ch.js"
    },
    module: {
      // needed due to incompatibility with webpack production mode. This is
      // for mapillary, but here's a similar issue for mapbox:
      // See https://github.com/mapbox/mapbox-gl-js/issues/4359
      noParse: /mapillary/,
      rules: [
        {
          test: /\.scss$/,
          use: [
            "style-loader",
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.html$/,
          loader: "underscore-template-loader",
          query: {
            root: "myapp",
            parseDynamicRoutes: true
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [["@babel/env", {
                targets: {
                  browsers: ["last 1 versions", "ie >= 11"]
                },
                exclude: ["transform-regenerator", "transform-async-to-generator"],
                debug: false,
                useBuiltIns: false
              }]],
              plugins: ["@babel/plugin-syntax-dynamic-import", "module:fast-async"]
            },
          }
        }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, "build"),
      compress: false,
      disableHostCheck: true,
      port: 9000,
      historyApiFallback: true,
      headers: {
        "Content-Security-Policy": [
          "worker-src blob:",
          "child-src blob:",
          "img-src data: blob: http: https:",
          "connect-src 'self' https: wss: http: ws:"
        ].join(" ; ")
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "base.[contenthash].ch.css"
      }),
      ...pages,
      new WebpackCdnPlugin({
        modules: [
          {
            name: 'mapillary-js',
            var: 'Mapillary',
            style: 'dist/mapillary.min.css'
          },
          {
            name: 'mapbox-gl',
            var: 'mapboxgl',
            style: 'dist/mapbox-gl.css'
          }
        ],
        publicPath: '/node_modules'
      }),
      new SitemapPlugin('https://veloroute.hamburg', sitemapURLs, {
        skipGzip: true
      }),
      new ScriptExtHtmlWebpackPlugin({
        preload: {
          test: /(images|app|polyfillChecker|checkWebGL|unpkg.com).*\.js$/i,
          chunks: 'all'
        }
      }),
      !isProduction ? null : new UglifyJsPlugin({
        extractComments: true,
        parallel: true,
        sourceMap: true
      }),
      !isProduction ? null : new OptimizeCSSAssetsPlugin({})
    ].filter(plugin => plugin !== null),
  }
};
