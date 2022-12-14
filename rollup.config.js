const path = require('path');

const commonjs = require('@rollup/plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const copy = require('rollup-plugin-copy');

const pkg = require('./package.json');
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      banner,
    },
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'auto',
      banner,
    },
    {
      file: pkg.browser,
      format: 'umd',
      name: 'placekit',
      banner,
    },
  ],
  external: [/node_modules/],
  plugins: [
    commonjs(),
    cleanup(),
    copy({
      targets: [
        {
          src: 'src/index.d.ts',
          dest: path.dirname(pkg.types),
          rename: path.basename(pkg.types),
          transform: (content) => [banner, content].join("\n"),
        },
      ]
    })
  ],
};
