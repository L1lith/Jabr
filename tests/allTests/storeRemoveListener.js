const { expect } = require('chai')
const createJabr = require('../../dist/createJabr')

describe('Jabr Store: .off / removeListener', () => {
  let store

  beforeEach(() => {
    store = createJabr({ x: 0, y: 0 })
  })

  it('should remove a previously added listener', () => {
    let callCount = 0
    const listener = () => callCount++
    store.on('x', listener)
    store.x = 5
    expect(callCount).to.equal(1) // listener fired

    store.off('x', listener)
    store.x = 10
    expect(callCount).to.equal(1) // should NOT fire again
  })

  it('should not throw if removing a listener that was never added', () => {
    const listener = () => {}
    expect(() => store.off('x', listener)).to.not.throw()
  })

  it('should throw if invalid prop is passed', () => {
    const listener = () => {}
    expect(() => store.off(123, listener)).to.throw(/Prop name must be a string/)
  })

  it('should throw if invalid callback is passed', () => {
    expect(() => store.off('x', null)).to.throw(/Callback must be a function/)
  })

  it('should throw if invalid event name is passed', () => {
    const listener = () => {}
    expect(() => store.off('x', listener, 'invalidEvent')).to.throw(/Invalid event name/)
  })

  it('should remove wildcard listeners', () => {
    let callCount = 0
    const wildcard = () => callCount++
    store.on('*', wildcard)
    store.x = 1
    store.y = 2
    expect(callCount).to.equal(2)

    store.off('*', wildcard)
    store.x = 3
    store.y = 4
    expect(callCount).to.equal(2) // no further calls
  })

  it('should only remove the specified listener', () => {
    let call1 = 0
    let call2 = 0
    const listener1 = () => call1++
    const listener2 = () => call2++
    store.on('x', listener1)
    store.on('x', listener2)

    store.off('x', listener1)
    store.x = 7

    expect(call1).to.equal(0)
    expect(call2).to.equal(1)
  })
})
