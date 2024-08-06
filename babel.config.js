const pkg = require('./package.json');

const baseConfig = { modules: false };

const legacyConfig = {
  useBuiltIns: 'usage',
  corejs: 3,
  targets: { ie: '11' },
};

const modernConfig = {
  targets: { safari: '15' },
};

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      process.env.BUILD_ENV === 'legacy'
        ? { ...baseConfig, ...legacyConfig }
        : { ...baseConfig, ...modernConfig },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-runtime'],
    ['transform-define', { QUILL_VERSION: pkg.version }],
  ],
};
