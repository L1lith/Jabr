import SignalClass from './classes/SignalClass'

const unspecified = Symbol('unspecified')

export default function createSignal(initialValue = undefined) {
  const signalBase = {}
  Object.setPrototypeOf(signalBase, SignalClass.prototype)
  Object.freeze(signalBase)
  let value = initialValue
  const listeners = []
  let propertyList
  let enumerables
  const methods = {
    set: (newValue = unspecified) => {
      if (newValue === unspecified) throw new Error('Must specify a value')
      const oldValue = value
      value = newValue
      listeners.forEach(listener => {
        // Trigger update listeners
        try {
          listener(newValue, oldValue)
        } catch (error) {
          console.error(error)
        }
      })
    },
    get: () => {
      return value
    },
    addListener: fn => {
      if (typeof fn != 'function') throw new Error('Must supply a valid function')
      if (!listeners.includes(fn)) {
        listeners.push(fn)
        return true
      }
      return false
    },
    removeListener: fn => {
      if (typeof fn != 'function') throw new Error('Must supply a valid function')
      if (listeners.includes(fn)) {
        listeners.splice(listeners.indexOf(fn, 1))
        return true
      }
      return false
    }
  }
  enumerables = [methods.get, methods.set, methods.addListener, methods.removeListener]
  propertyList = Object.keys(methods).concat(Object.keys(enumerables))
  return new Proxy(signalBase, {
    get: (target, prop) => {
      if (prop === '__isJabrSignal') return true
      if (methods.hasOwnProperty(prop)) return methods[prop]
      if (enumerables.hasOwnProperty(prop)) return enumerables[prop]
      if (prop === Symbol.iterator) {
        return function* () {
          for (const key of Object.keys(enumerables)) {
            yield enumerables[key]
          }
        }
      }
      return undefined
    },
    set: () => undefined,
    deleteProperty: () => undefined,
    getPrototypeOf: () => {
      return SignalClass.prototype
    },
    has: prop => propertyList.includes(prop),
    ownKeys(target) {
      if (target === signalBase) return propertyList
      return Reflect.ownKeys(target)
    }
  })
}
