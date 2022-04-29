module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'cjs',
        targets: {
          node: 14
        }
      }
    ]
  ],
  plugins: ['add-module-exports']
  //   env: {
  //     test: {
  //       // Make jest not angry when we use fancy features, not a problem for users because they'll be bundling our lib anyways
  //     }
  //   }
}
