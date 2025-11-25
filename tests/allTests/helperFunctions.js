const makeID = require('../functions/makeID')
const { Jabr, Signal, isSignal, isStore } = require('../../dist/')
const chai = require('chai')
const { Format } = require('sandhands')
const { assert, expect } = chai

describe('Helper Functions', () => {
  it('Correctly identifies stores', () => {
    const store = new Jabr()
    expect(isStore(store)).to.equal(true)
  })
  it('Correctly identifies signals', () => {
    const signal = new Signal()
    expect(isSignal(signal)).to.equal(true)
  })
  it('Correctly identifies non-stores', () => {
    const signal = new Signal()
    const nonStores = [signal, null, undefined, {}, [], 1, 'test string']
    nonStores.forEach(nonStore => {
      expect(isStore(nonStore)).to.equal(false)
    })
  })
  it('Correctly identifies non-signals', () => {
    const store = new Jabr()
    const nonSignals = [store, null, undefined, {}, [], 1, 'test string']
    nonSignals.forEach(nonSignal => {
      expect(isSignal(nonSignal)).to.equal(false)
    })
  })
})
