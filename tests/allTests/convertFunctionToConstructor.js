const { expect } = require('chai')
const { convertFunctionToConstructor } = require('../../dist/')

describe('convertFunctionToConstructor', () => {
  it('calls underlying function normally', () => {
    function add(a, b) {
      return a + b
    }
    const fn = convertFunctionToConstructor(add)
    expect(fn(2, 3)).to.equal(5)
  })

  it('works with new to simulate constructor behavior', () => {
    function Point(x, y) {
      this.x = x
      this.y = y
    }
    const C = convertFunctionToConstructor(Point)

    const p = new C(4, 9)

    expect(p).to.be.an('object')
    expect(p.x).to.equal(4)
    expect(p.y).to.equal(9)
    expect(p).to.be.instanceOf(Point)
  })

  it('respects optionalClass prototype when valid', () => {
    class Shape {}
    function makeShape(name) {
      this.name = name
    }

    const C = convertFunctionToConstructor(makeShape, Shape)
    const s = new C('circle')

    expect(s.name).to.equal('circle')
    expect(s).to.be.instanceOf(Shape)
  })

  it('ignores optionalClass when not a function', () => {
    function ObjMaker(a) {
      this.a = a
    }

    const C = convertFunctionToConstructor(ObjMaker, { notAFunction: true })
    const obj = new C(10)

    expect(obj.a).to.equal(10)
    expect(obj).to.be.instanceOf(ObjMaker)
  })

  it('creates object with fallback prototype if fn.prototype is missing', () => {
    // arrow function has no prototype
    const creator = x => ({ val: x })

    const C = convertFunctionToConstructor(creator)
    const obj = new C(7)

    expect(obj.val).to.equal(7)
    // can't use instanceOf because no prototype, but ensure it's an object
    expect(obj).to.be.an('object')
  })

  it('uses object returned by underlying fn instead of created instance', () => {
    function factory(x) {
      return { value: x, special: true }
    }

    const C = convertFunctionToConstructor(factory)
    const result = new C(5)

    expect(result.special).to.equal(true)
    expect(result.value).to.equal(5)
  })

  it('falls back to constructed obj when fn returns primitive', () => {
    function factory(x) {
      this.x = x
      return 123 // ignored
    }

    const C = convertFunctionToConstructor(factory)
    const result = new C(8)

    expect(result.x).to.equal(8)
    expect(result).to.be.an('object')
  })

  it('passes correct `this` when called normally', () => {
    function setVal(v) {
      this.v = v
      return this
    }
    const C = convertFunctionToConstructor(setVal)

    const obj = { existing: true }
    C.call(obj, 42)

    expect(obj.v).to.equal(42)
  })

  it('proxy should adopt optionalClass name when valid class is provided', () => {
    class Widget {}
    function fn() {}

    const C = convertFunctionToConstructor(fn, Widget)

    expect(C.name).to.equal('Widget')
  })
})
