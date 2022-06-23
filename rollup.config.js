import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.js',
      format: 'cjs',
      exports: 'default',
    },
    {
      file: 'dist/bundle.min.js',
      format: 'umd',
      name: 'MyModuleName',
      plugins: [terser()],
    },
  ],
  plugins: [
    commonjs(),
  ],
};
