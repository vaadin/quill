const pkg = require('./package.json');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
        targets: { ie: '11' },
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-runtime'],
    ['transform-define', { QUILL_VERSION: pkg.version }],
  ],
};
