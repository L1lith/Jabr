const makeID = require('../functions/makeID')
const { Jabr, Signal } = require('../../dist/')
const chai = require('chai')
const { Format } = require('sandhands')
const { assert, expect } = chai

describe('Standalone Signal Functionality', () => {
  it('should allow you to read the value from the value you initialized it with', () => {
    const signal = new Signal(3)
    expect(signal.get()).to.equal(3)
  })
  it('should allow you to set and read values using the destructuring syntax', () => {
    const [get, set] = new Signal()
    set(4)
    expect(get()).to.equal(4)
  })
  it('should allow you to subscribe to changes', () => {
    const [get, set, addListener] = new Signal()
    let gotNewValue = null
    let gotOldValue = null
    addListener((newValue, oldValue) => {
      gotNewValue = newValue
      gotOldValue = oldValue
    })
    set(63)
    expect(gotNewValue).to.equal(63)
    expect(gotOldValue).to.equal(undefined)
  })
  it('should allow you to unsubscribe from changes', () => {
    const [get, set, addListener, removeListener] = new Signal()
    let gotNewValue = null
    let gotOldValue = null
    const listener = (newValue, oldValue) => {
      gotNewValue = newValue
      gotOldValue = oldValue
    }
    addListener(listener)
    removeListener(listener)
    set(63)
    expect(gotNewValue).to.equal(null)
    expect(gotOldValue).to.equal(null)
  })
})

describe('Store Signal Functionality', () => {
  it('should support the getSignal method', () => {
    const store = new Jabr({})
    expect(store.getSignal('age')).to.be.an('object')
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
  it('supports the $ signal access shorthand', () => {
    const store = new Jabr({})
    expect(store.$b).to.be.an('object')
  })
})
