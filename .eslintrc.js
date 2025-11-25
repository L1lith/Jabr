module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowImportExportEverywhere: true
  },
  rules: {
    'no-unused-vars': 'off', // complaining about our proxies :(
    semi: ['error', 'never'],
    quotes: ['error', 'single']
  },
  plugins: ['mocha']
}
