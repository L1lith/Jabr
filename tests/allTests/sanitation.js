const makeID = require('../functions/makeID')
const Jabr = require('../../dist/Jabr')
const chai = require('chai')
const { Format } = require('sandhands')
const { assert, expect } = chai

describe('Data Sanitation', () => {
  it('should enforce basic sanitation', () => {
    const store = new Jabr(
      {},
      {
        age: {
          format: Format(Number)
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
  it('should not be strict by default', () => {
    const store = new Jabr(
      {},
      {
        age: { format: Number }
      }
    ) 
    expect(() => {
      store.color = 'green'
    }).to.not.throw()
  })
  it('should support being flagged as strict', () => {
    const store = new Jabr(
      {},
      {
        age: { format: Number }
      },
      { strict: true }
    )
    expect(() => {
      store.color = 'green'
    }).to.throw()
  })
  it('validates sanitation on computed properties with correct values', () => {
    const randomPropertyID = makeID()
    const properties = {}
    properties[randomPropertyID] = { format: Number, compute: () => Math.random() }
    const store = new Jabr({}, properties)
    expect(() => {
      store[randomPropertyID]
    }).to.not.throw()
  })
  it('enforces sanitation on computed properties with incorrect values', () => {
    const randomPropertyID = makeID()
    const randomValue = Math.random()
    const computedProperties = {}
    computedProperties[randomPropertyID] = { compute: () => randomValue, format: String }
    const store = new Jabr({}, computedProperties)
    expect(() => {
      store[randomPropertyID]
    }).to.throw()
  })
})
