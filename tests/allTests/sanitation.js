const makeID = require('../functions/makeID')
const Jabr = require('../../dist/Jabr-commonjs')
const chai = require('chai')
const { assert, expect } = chai

describe('Data Sanitation', () => {
  it('should enforce basic sanitation', () => {
    const store = new Jabr(
      {},
      {
        format: {
          age: Number
        }
      }
    )
    expect(() => {
      store.age = 'this is a random incorrect value'
    }).to.throw()
    expect(() => {
      store.age = 32
    }).to.not.throw()
  })
  it('should be strict by default', () => {
    const store = new Jabr(
      {},
      {
        format: {
          age: Number
        }
      }
    )
    expect(() => {
      store.color = 'green'
    }).to.throw()
  })
  it('should support being flagged as non-strict', () => {
    const store = new Jabr(
      {},
      {
        format: {
          age: Number,
          strict: false
        }
      }
    )
    expect(() => {
      store.color = 'green'
    }).to.not.throw()
  })
  it('validates sanitation on computed properties with correct values', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const computedProperties = {}
    computedProperties[randomPropertyID] = () => randomValue
    const format = {}
    format[randomPropertyID] = Number
    const store = new Jabr({}, { computedProperties, format })
    expect(() => {
      store[randomPropertyID]
    }).to.not.throw()
  })
  it('enforces sanitation on computed properties with incorrect values', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const computedProperties = {}
    computedProperties[randomPropertyID] = () => randomValue
    const format = {}
    format[randomPropertyID] = String
    const store = new Jabr({}, { computedProperties, format })
    expect(() => {
      store[randomPropertyID]
    }).to.throw()
  })
})
