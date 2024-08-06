/* eslint-env node */
const { BannerPlugin, DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const bannerPack = new BannerPlugin({
  banner: [
    `Quill Editor v${pkg.version}`,
    pkg.homepage,
    'Copyright (c) 2014, Jason Chen',
    'Copyright (c) 2013, salesforce.com',
  ].join('\n'),
  entryOnly: true,
});
const constantPack = new DefinePlugin({
  QUILL_VERSION: JSON.stringify(pkg.version),
});

const source = [
  'quill.js',
  'core.js',
  'vaadin-quill.js',
  'blots',
  'core',
  'formats',
  'modules',
  'test',
  'themes',
  'ui'
].map(function(file) {
  return resolve(__dirname, '..', file);
});

const jsRules = {
  test: /\.js$/,
  include: source,
  use: ['babel-loader'],
};

const sourceMapRules = {
  test: /\.js$/,
  enforce: 'pre',
  use: ['source-map-loader'],
};

const svgRules = {
  test: /\.svg$/,
  include: [resolve(__dirname, 'src/assets/icons')],
  use: [
    {
      loader: 'html-loader',
      options: {
        minimize: true,
      },
    },
  ],
};

const stylRules = {
  test: /\.styl$/,
  include: [resolve(__dirname, 'src/assets')],
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
};

module.exports = function(env) {
  let config = {
    context: resolve(__dirname, '..'),
    entry: {
      // 'quill.js': ['./quill.js'],
      // 'quill.core.js': ['./core.js'],
      'vaadin-quill.js': ['./vaadin-quill.js'],
      // 'quill.core': './assets/core.styl',
      // 'quill.bubble': './assets/bubble.styl',
      // 'quill.snow': './assets/snow.styl',
      // 'unit.js': './test/unit.js'
    },
    output: {
      filename: '[name]',
      library: {
        name: 'Quill',
        type: 'umd',
        export: 'default',
      },
      path: resolve(__dirname, '../dist/'),
      clean: true,
    },
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      minimize: false
    },
    resolve: {
      extensions: ['.js', '.styl']
    },
    module: {
      rules: [jsRules, stylRules, svgRules, sourceMapRules],
    },
    plugins: [
      bannerPack,
      constantPack,
      new MiniCssExtractPlugin({
        filename: '[name]',
      }),
    ],
    devServer: {
      contentBase: resolve(__dirname, '../dist'),
      hot: false,
      port: process.env.npm_package_config_ports_webpack,
      stats: 'minimal',
      disableHostCheck: true
    }
  };

  if (process.env.BUILD_ENV === 'legacy') {
    config.target = ['web', 'es5'];
  }

  if (env && env.minimize) {
    config.entry = {
      // 'quill.min.js': './quill.js',
      'vaadin-quill.min.js': './vaadin-quill.js'
    };
    config.mode = 'production';
    config.optimization.minimize = true;
    config.optimization.minimizer = [
      new TerserPlugin({
        extractComments: false,
      })
    ];
  }

  return config;
};
