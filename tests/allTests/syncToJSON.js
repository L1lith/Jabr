const { Jabr, syncToJSON } = require('../../dist/')
const chai = require('chai')
const { readFileSync, mkdirSync } = require('fs')
const { assert, expect } = chai
const { join } = require('path')

const exampleJSON = join(__dirname, '..', 'boiler', 'example.json')
const editableJSON = join(__dirname, 'tmp', 'store.json')
let exampleJSONRaw

describe('syncToJSON Behavior', () => {
  before(() => {
    exampleJSONRaw = readFileSync(exampleJSON, 'utf8')
  })
  it('Can read JSON files properly without modifying them', () => {
    const store = new Jabr()
    syncToJSON(store, exampleJSON)
    assert.deepEqual(store, { a: 12 })
    assert.strictEqual(exampleJSONRaw, readFileSync(exampleJSON, 'utf8'))
  })
  before(() => {
    try {
      mkdirSync(join(__dirname, 'tmp'))
    } catch (err) {}
  })
  it('Can edit json files properly', () => {
    const store = new Jabr()
    syncToJSON(store, editableJSON)
    const randomValue = Math.random()
    store.b = randomValue
    assert.deepEqual(JSON.parse(readFileSync(editableJSON)), { b: randomValue })
  })
})
