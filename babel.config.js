const pkg = require('./package.json');

module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    ['transform-define', { QUILL_VERSION: pkg.version }],
  ],
};
