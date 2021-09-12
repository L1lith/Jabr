const { readFileSync, writeFileSync } = require('fs')
//const { readFile, writeFile } = require('fs/promises')

function syncToJSON(store, jsonPath) {
  let data = null
  try {
    data = JSON.parse(readFileSync(jsonPath))
    if (typeof data != 'object') throw new Error('json data should be an object')
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err
  }
  if (data !== null) {
    const oldWarn = console.warn
    console.warn = () => {}
    Object.entries(data).forEach(([key, value]) => {
      store[key] = value
    })
    console.warn = oldWarn
  }

  store.on('*', () => {
    writeFileSync(jsonPath, JSON.stringify(store))
  })
}

export default syncToJSON
