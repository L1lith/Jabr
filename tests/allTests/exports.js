const chai = require('chai')
const { assert, expect } = chai
const { details } = require('sandhands')

const exportsFormats = { Jabr: Function, createJabr: Function }

describe('Has the correct exports', () => {
  it('loads the library successfully', () => {
    expect(() => {
      require('../../dist/index.js')
    }).to.not.throw()
  })
  it('returns the correct exports', () => {
    const jabr = require('../../dist/index.js')
    expect(jabr).to.be.a('object', 'the default export is an object')
    Object.entries(exportsFormats).forEach(([name, format]) => {
      assert.strictEqual(details(jabr[name], format), null, `${name} export is well formatted.`)
    })
  })
})
