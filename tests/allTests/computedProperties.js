const makeID = require('../functions/makeID')
const Jabr = require('../../dist/Jabr')
const chai = require('chai')
const { assert, expect } = chai

describe('Computed Properties', () => {
  it('returns a single computed property correctly', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const computedProperties = {}
    computedProperties[randomPropertyID] = { compute: () => randomValue }
    const store = new Jabr({}, computedProperties)
    assert.strictEqual(store[randomPropertyID], randomValue)
  })
  it('returns a changing computed property correctly', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const replacementValue = Math.random() + 1 // Ensure it can't be the same value as the other random value
    let isReplaced = false
    const computedProperties = {}
    computedProperties[randomPropertyID] = {
      compute: () => {
        if (isReplaced === false) {
          isReplaced = true
          return randomValue
        } else {
          return replacementValue
        }
      }
    }
    const store = new Jabr({}, computedProperties)
    assert.strictEqual(store[randomPropertyID], randomValue, 'random value')
    assert.strictEqual(store[randomPropertyID], replacementValue, 'replacement value')
  })
  it('cannot overwrite computed properties', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const computedProperties = {}
    computedProperties[randomPropertyID] = { compute: () => randomValue }
    const store = new Jabr({}, computedProperties)
    assert.strictEqual(store[randomPropertyID], randomValue)
    expect(() => {
      store[randomPropertyID] = Math.random + 1
    }).to.throw()
  })
  it('cannot initialize values who are computed', () => {
    expect(() => {
      const store = new Jabr({ derp: 13 }, { derp: { compute: () => 12 } })
      store.derp
    }).to.throw()
  })
})
