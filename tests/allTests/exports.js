const chai = require('chai')
const { assert, expect } = chai
const { details } = require('sandhands')

const exportsFormats = { Jabr: Function, createJabr: Function }

describe('Has the correct exports', () => {
  it('loads the library successfully', () => {
    expect(() => {
      require('../../dist/Jabr')
    }).to.not.throw()
  })
  it('returns the correct exports', () => {
    const jabr = require('../../dist/Jabr')
    expect(jabr).to.be.a('function', 'the default export is a function')
    Object.entries(exportsFormats).forEach(([name, format]) => {
      assert.strictEqual(details(jabr[name], format), null, `${name} export is well formatted.`)
    })
  })
})
