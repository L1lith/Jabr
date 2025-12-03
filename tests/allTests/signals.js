const makeID = require('../functions/makeID')
const { Jabr, Signal } = require('../../dist/')
const chai = require('chai')
const { assert, expect } = chai
const { Format } = require('sandhands')

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
  it('should properly allow you to access itself via the .self property', () => {
    const ourSignal = new Signal()
    expect(ourSignal).to.equal(ourSignal.self)
  })
  it('should properly support object destructuring syntax, and behave the same as direct property access', () => {
    let ourSignal, getter, setter, selfValue
    expect(() => {
      ourSignal = new Signal()
      const { get, set, self } = ourSignal
      getter = get
      setter = set
      selfValue = self
    }).to.not.throw()
    expect(getter).to.be.a('function').and.to.equal(ourSignal.get)
    expect(setter).to.be.a('function').and.to.equal(ourSignal.set)
    expect(selfValue).to.equal(ourSignal)
  })
  it('should throw if set() is called without a value', () => {
    const [, set] = new Signal()
    expect(() => set()).to.throw()
  })
  it('should not add the same listener twice', () => {
    const [, , addListener] = new Signal()
    const fn = () => {}
    expect(addListener(fn)).to.equal(true)
    expect(addListener(fn)).to.equal(false)
  })
  it('should support array destructuring via iterator', () => {
    const signal = new Signal()
    const [get, set, addListener, removeListener] = signal
    expect(get).to.equal(signal.get)
    expect(set).to.equal(signal.set)
    expect(addListener).to.equal(signal.addListener)
    expect(removeListener).to.equal(signal.removeListener)
  })
})

describe('Signal with Sandhands Format', () => {
  it('should initialize with a valid value', () => {
    const sig = Signal(5, Number)
    expect(sig.get()).to.equal(5)
  })

  it('should throw on invalid initial value', () => {
    expect(() => Signal('hello', Number)).to.throw(/Invalid Initial Value/)
  })

  it('should set valid values', () => {
    const sig = Signal(0, Number)
    sig.set(10)
    expect(sig.get()).to.equal(10)
  })

  it('should throw when setting an invalid value', () => {
    const sig = Signal(0, Number)
    expect(() => sig.set('not a number')).to.throw(/Invalid Assignment Value/)
  })

  it('should add and remove listeners', () => {
    const sig = Signal(0, Number)
    let called = false
    const listener = () => (called = true)
    sig.addListener(listener)
    sig.set(1)
    expect(called).to.be.true
    called = false
    sig.removeListener(listener)
    sig.set(2)
    expect(called).to.be.false
  })

  it('should remove all listeners', () => {
    const sig = Signal(0, Number)
    let called1 = false
    let called2 = false
    sig.addListener(() => (called1 = true))
    sig.addListener(() => (called2 = true))
    sig.removeAllListeners()
    sig.set(5)
    expect(called1).to.be.false
    expect(called2).to.be.false
  })

  it('should support once listeners', () => {
    const sig = Signal(0, Number)
    let count = 0
    sig.once(() => count++)
    sig.set(1)
    sig.set(2)
    expect(count).to.equal(1)
  })

  it('should allow cancellation of once listener before firing', () => {
    const sig = Signal(0, Number)
    let count = 0
    const cancel = sig.once(() => count++)
    cancel()
    sig.set(1)
    expect(count).to.equal(0)
  })

  it('should reset to the initial value', () => {
    const sig = Signal(10, Number)
    sig.set(99)
    expect(sig.get()).to.equal(99)
    sig.resetValue()
    expect(sig.get()).to.equal(10)
  })

  it('should expose initial value and self properties', () => {
    const sig = Signal(42, Number)
    expect(sig.initial).to.equal(42)
    expect(sig.self).to.equal(sig)
  })

  it('should allow object destructuring access', () => {
    const sig = Signal(5, Number)
    const { get, set, removeAllListeners, once, resetValue, self, initial } = sig
    expect(get()).to.equal(sig.get())
    set(10)
    expect(get()).to.equal(10)
    expect(self).to.equal(sig)
    expect(initial).to.equal(5)
    expect(removeAllListeners).to.be.a('function')
    expect(once).to.be.a('function')
    expect(resetValue).to.be.a('function')
  })
})

describe('Additional Signal Methods', () => {
  // -------------------
  // reset()
  // -------------------
  it('resetValue() should restore the signal to its initial value', () => {
    const signal = new Signal(42)
    const { get, set, resetValue } = signal
    set(100)
    expect(get()).to.equal(100)
    resetValue()
    expect(get()).to.equal(42)
  })

  it('resetValue() should work multiple times consistently', () => {
    const signal = new Signal('foo')
    const { get, set, resetValue } = signal
    set('bar')
    expect(get()).to.equal('bar')
    resetValue()
    expect(get()).to.equal('foo')
    set('baz')
    resetValue()
    expect(get()).to.equal('foo')
  })

  // -------------------
  // once()
  // -------------------
  it('once() should trigger the listener only once', () => {
    const signal = new Signal(0)
    const { set, once } = signal
    let callCount = 0
    once(() => callCount++)
    set(1)
    set(2)
    set(3)
    expect(callCount).to.equal(1)
  })

  it('once() should allow cancelling before it fires', () => {
    const signal = new Signal(0)
    const { set, once } = signal
    let called = false
    const cancel = once(() => {
      called = true
    })
    cancel()
    set(10)
    expect(called).to.equal(false)
  })

  // -------------------
  // removeAllListeners()
  // -------------------
  it('removeAllListeners() should remove all registered listeners', () => {
    const signal = new Signal(0)
    const { set, addListener, removeAllListeners } = signal
    let called1 = false
    let called2 = false
    const fn1 = () => {
      called1 = true
    }
    const fn2 = () => {
      called2 = true
    }

    addListener(fn1)
    addListener(fn2)
    removeAllListeners()
    set(5)

    expect(called1).to.equal(false)
    expect(called2).to.equal(false)
  })

  it('removeAllListeners() should not affect new listeners added afterwards', () => {
    const signal = new Signal(0)
    const { set, addListener, removeAllListeners } = signal
    let called = false
    removeAllListeners()
    addListener(() => {
      called = true
    })
    set(10)
    expect(called).to.equal(true)
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
