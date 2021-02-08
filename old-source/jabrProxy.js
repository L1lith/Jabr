const Jabr = require('./Jabr')
const JabrResult = require('./JabrResult')

function createJabrProxy(initialStore) {
  const jabr = new Jabr(initialStore)
  return dataProxy(jabr, jabr.store)
}

const toStringSymbols = ['Symbol(util.inspect.custom)', 'Symbol(Symbol.toStringTag)']

const jabrRedirects = {
  on: 'addListener',
  addListener: 'addListener',
  removeListener: 'removeListener'
}

const $return = input => () => input

function dataProxy(jabr, parent, pathChain = []) {
  return new Proxy(parent, {
    get: (target, prop) => {
      const rawData = target === jabr ? jabr.store : target
      if (prop === 'toJSON') return () => JSON.stringify(rawData)
      if (typeof prop === 'symbol' && toStringSymbols.includes(String(prop))) {
        return target.toString()
      }
      if (typeof prop != 'string') throw new Error('Expected String Property')
      if (prop === 'valueOf') return () => rawData
      if (jabrRedirects.hasOwnProperty(prop)) return jabr[jabrRedirects[prop]]
      if (prop === '_Jabr') return jabr
      const value = jabr.get(...pathChain, prop)
      if (typeof value == 'object' && value !== null) {
        return dataProxy(jabr, value, pathChain.concat(prop))
      } else {
        return value
      }
    },
    set: (target, prop, value) => {
      jabr.set(...pathChain, prop, value)
      return true
    },
    has: (target, prop) => {
      return jabr.has(...pathChain, prop)
    },
    deleteProperty: (target, prop) => {
      jabr.delete(...pathChain, prop)
    },
    ownKeys: target => {
      return jabr.keys(...pathChain)
    },
    construct: () => {
      return createJabrProxy
    },
    isExtensible: $return(true),
    setPrototypeOf: $return(false),
    defineProperty: $return(false),
    getPrototypeOf: () => (pathChain.length === 0 ? Jabr.prototype : JabrResult.prototype)
  })
}

module.exports = createJabrProxy
