const makeID = require('../functions/makeID')
const { Jabr } = require('../../dist/Jabr')
const chai = require('chai')
const { assert, expect } = chai

describe('Debug Behavior', () => {
  it('Allows hidden access to the input arguments', () => {
    const randomFunction = () => Math.random()
    const store = new Jabr({ random: randomFunction }, { random: Function }, { strict: true })
    assert.deepEqual(store.__args, {
      options: { strict: true },
      properties: { random: Function },
      valueMap: { random: randomFunction }
    })
  })
})
