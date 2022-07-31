import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

import packageJSON from './package.json';
const banner = [
  `/*! PlaceKit v${packageJSON.version}`,
  '© placekit.io',
  'MIT License',
  `${packageJSON.homepage} */`,
].join(' | ');

export default {
  input: 'src/index.js',
  output: [
    {
      file: packageJSON.module,
      format: 'es',
      banner,
    },
    {
      file: packageJSON.main,
      format: 'cjs',
      exports: 'auto',
      banner,
    },
    {
      file: packageJSON.browser,
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
          dest: path.dirname(packageJSON.types),
          rename: path.basename(packageJSON.types),
          transform: (content) => [banner, content].join("\n"),
        },
      ]
    })
  ],
};
