import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
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
      file: 'dist/placekit.esm.js',
      format: 'es',
      banner,
    },
    {
      file: 'dist/placekit.cjs.js',
      format: 'cjs',
      exports: 'auto',
      banner,
    },
    {
      file: 'dist/placekit.umd.js',
      format: 'umd',
      name: 'PlaceKit',
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
  ],
};
