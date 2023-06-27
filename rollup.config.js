import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';

import pkg from './package.json' assert { type: 'json' };
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

export default {
  input: 'src/placekit.js',
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
  plugins: [
    commonjs(),
    cleanup(),
    copy({
      targets: [
        {
          src: 'src/placekit.d.ts',
          dest: path.dirname(pkg.types),
          rename: path.basename(pkg.types),
          transform: (content) => [banner, content].join("\n"),
        },
      ]
    })
  ],
};
