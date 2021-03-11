import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { join } from 'path'
import babel from 'rollup-plugin-babel'
import deepmerge from 'deepmerge'

const baseConfig = {
  input: join(__dirname, 'source', 'index.js'),
  output: {
    name: 'Jabr'
  },
  name: 'Jabr',
  plugins: [
    resolve({ jsnext: true }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    })
  ]
}

const branchConfigs = [
  {
    output: {
      format: 'iife',
      file: join(__dirname, 'dist', 'Jabr-browser.min.js')
    }
  },
  {
    output: {
      format: 'cjs',
      file: join(__dirname, 'dist', 'Jabr-commonjs.js')
    }
  },
  {
    output: {
      format: 'umd',
      file: join(__dirname, 'dist', 'Jabr-universal.min.js')
    }
  }
]

const configs = branchConfigs.map(config => deepmerge(baseConfig, config))

configs[1].plugins.splice(0, 1) // Don't include dependencies in node bundle
//configs[1].plugins.splice(2) // Don't Uglify the node bundle
export default configs
