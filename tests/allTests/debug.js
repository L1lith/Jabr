const makeID = require('../functions/makeID')
const Jabr = require('../../dist/Jabr')
const chai = require('chai')
const { assert, expect } = chai

describe('Debug Behavior', () => {
  it('Allows hidden access to the input arguments', () => {
    const randomFunction = () => Math.random()
    const store = new Jabr({ random: 12 }, { random: randomFunction })
    assert.deepEqual(store.__args, {
      options: {},
      properties: { random: randomFunction },
      valueMap: { random: 12 }
    })
  })
})
