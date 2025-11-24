const makeID = require('../functions/makeID')
const { Jabr } = require('../../dist/')
const chai = require('chai')
const { Format } = require('sandhands')
const { assert, expect } = chai

describe('Signal Functionality', () => {
  it('should support the getSignal method', () => {
    const store = new Jabr({})
    expect(store.getSignal('age')).to.be.an('array')
  })
  it('should retrieve preset values', () => {
    const store = new Jabr({ age: 12 })
    expect(store.getSignal('age')[0]()).to.equal(12)
  })
  it('should support setting values and getting them back correctly', () => {
    const store = new Jabr({ age: 12 })
    const [getValue, setValue] = store.getSignal('age')
    setValue(42)
    expect(getValue()).to.equal(42)
  })
  //   it('validates sanitation on computed properties with correct values', () => {
  //     const randomPropertyID = makeID()
  //     const properties = {}
  //     properties[randomPropertyID] = { format: Number, compute: () => Math.random() }
  //     const store = new Jabr({}, properties)
  //     expect(() => {
  //       store[randomPropertyID]
  //     }).to.not.throw()
  //   })
  //   it('enforces sanitation on computed properties with incorrect values', () => {
  //     const randomPropertyID = makeID()
  //     const randomValue = Math.random()
  //     const computedProperties = {}
  //     computedProperties[randomPropertyID] = { compute: () => randomValue, format: String }
  //     const store = new Jabr({}, computedProperties)
  //     expect(() => {
  //       store[randomPropertyID]
  //     }).to.throw()
  //   })
})
