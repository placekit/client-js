import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';

import pkg from './package.json' assert { type: 'json' };
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

export default [
  {
    input: 'src/placekit-lite.js',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].umd.js',
        format: 'umd',
        name: 'placekit',
        banner,
      },
    ],
    plugins: [
      cleanup(),
    ],
  },
  {
    input: [
      'src/placekit-lite.js',
      'src/placekit.js',
    ],
    output: [
      {
        dir: 'dist',
        format: 'es',
        banner,
      },
      {
        dir: 'dist',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        exports: 'default',
        banner,
      },
    ],
    plugins: [
      cleanup(),
      replace({
        preventAssignment: true,
        values: {
          '__PLACEKIT_VERSION__': pkg.version,
        }
      }),
      copy({
        targets: [
          {
            src: 'src/placekit-lite.d.ts',
            dest: 'dist',
            transform: (content) => [banner, content].join("\n"),
          },
          {
            src: 'src/placekit.d.ts',
            dest: 'dist',
            transform: (content) => [banner, content].join("\n"),
          },
        ]
      })
    ],
  },
];
