import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

export default {
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
      plugins: [
        terser({
          format: {
            preamble: banner,
            comments: false,
          }
        }),
      ],
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
