const chai = require('chai')
const { assert, expect } = chai
const { details } = require('sandhands')

const exportFormat = Object.assign(Function, { Jabr: Object, createJabr: Function })

describe('Has the correct exports', () => {
  it('loads the library successfully', () => {
    expect(() => {
      require('../../dist/Jabr')
    }).to.not.throw()
  })
  it('returns the correct exports', () => {
    const jabr = require('../../dist/Jabr')
    assert.strictEqual(
      details(jabr, exportFormat),
      null,
      'passes the sandhands format for the exports'
    )
    expect(jabr).to.be.an.instanceof(jabr.Jabr, 'jabr export is an instanceof the Jabr class')
  })
})
