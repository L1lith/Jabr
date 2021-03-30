import createJabr from './functions/createJabr'
import Jabr from './classes/Jabr'

const exports = { createJabr, Jabr }

export default new Proxy(
  Object.assign(function (args) {
    return createJabr(...args)
  }, exports),
  {
    set: () => {
      throw new Error('Cannot overwrite the library')
    },
    // get: (target, prop) => {
    //   if (exports.hasOwnProperty(prop)) return exports[prop]
    //   //console.warn(new Error('The library does not export "' + prop + '"'))
    //   return Reflect.get({}, prop)
    // },
    getPrototypeOf: () => Jabr.prototype,
    setPrototypeOf: () => {
      throw new Error('Cannot overwrite the library')
    },
    isExtensible: () => false,
    deleteProperty: () => {
      throw new Error('Cannot overwrite the library')
    },
    construct: (target, args) => {
      return createJabr(...args)
    }
  }
)
