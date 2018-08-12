const Jabr = require('./Jabr')

function createJabrProxy() {
  const jabr = new Jabr()
  return dataProxy(jabr, jabr.store)
}

const eventRedirects = {
  on: 'addListener',
  addListener: 'addListener',
  removeListener: 'removeListener'
}

const returnFalse = ()=>false
const returnTrue = ()=>true

function dataProxy(jabr, parent, pathChain = []) {
  return new Proxy(parent, {
    get: (target, prop) => {
      if (eventRedirects.hasOwnProperty(prop)) {
        return jabr[eventRedirects[prop]].bind(null, ...pathChain)
      }
      const value = parent[prop]
      if (typeof value == 'object' && value !== null) {
        return dataProxy(jabr, value, pathChain.concat(prop))
      } else {
        return value
      }
    },
    set: (target, prop, value) => {
      jabr.set(...pathChain, prop, value)
    },
    has: (target, prop) => {
      return jabr.has(...pathChain, prop)
    },
    deleteProperty: (target, prop) => {
      jabr.delete(...pathChain, prop)
    },
    ownKeys: (target) => {
      return jabr.keys(...pathChain)
    },
    construct: ()=>{
      return createJabrProxy
    },
    isExtensible: returnTrue,
    setPrototypeOf: returnFalse,
    defineProperty: returnFalse,
    getPrototypeOf: ()=>Jabr
  })
}

module.exports = createJabrProxy
