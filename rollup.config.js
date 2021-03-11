import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
export default {
  input: './lib/index.js',
  output: [
    {
      file: './dist/index.umd.js',
      format: 'umd',
      name: 'PromiseWorker'
    },
    { file: './dist/index.cjs.js', format: 'cjs' },
    { file: './dist/index.esm.js', format: 'esm' }
  ],
  sourceMap: true,
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs(),
    terser({
      compress: {
        drop_debugger: true,
        drop_console: process.env.NODE_ENV === 'production'
      }
    }),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' })
  ]
}
