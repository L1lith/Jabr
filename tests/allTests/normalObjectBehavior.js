const makeID = require('../functions/makeID')
const Jabr = require('../../dist/Jabr-commonjs')
const chai = require('chai')
const { assert } = chai

const defaultTimeout = 1000 * 30 // 30 seconds

describe('Normal Object Behavior', () => {
  it('is empty by default', () => {
    const emptyStore = new Jabr()
    assert.deepEqual(emptyStore, {})
  })
  it('saves values and retrieves data correctly', () => {
    const store = new Jabr()
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    store[randomPropertyID] = randomValue
    assert.strictEqual(store[randomPropertyID], randomValue)
  })
  it('calls the callback function with the correct value when setting properties', done => {
    const store = new Jabr()
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    let timeoutInterval = null
    store.on(randomPropertyID, newValue => {
      clearTimeout(timeoutInterval)
      assert.strictEqual(newValue, randomValue)
      done()
    })
    timeoutInterval = setTimeout(() => {
      done(new Error('Timed out waiting for the callback'))
    }, defaultTimeout)
    store[randomPropertyID] = randomValue
  })
  it('calls the callback function with the correct value when deleting properties', done => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const storeObject = {}
    storeObject[randomPropertyID] = randomValue
    const store = new Jabr(storeObject)
    let timeoutInterval = null
    store.on(randomPropertyID, newValue => {
      clearTimeout(timeoutInterval)
      assert.strictEqual(newValue, undefined)
      done()
    })
    timeoutInterval = setTimeout(() => {
      done(new Error('Timed out waiting for the callback'))
    }, defaultTimeout)
    delete store[randomPropertyID]
  })
})
