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
})
