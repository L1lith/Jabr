import Jabr from './classes/JabrClass'
// import { sanitize, Format } from 'sandhands'
// import onlyUnique from './functions/onlyUnique'
import parseJabrOptions from './functions/parseJabrOptions'
import PropertyMapper from './classes/PropertyMapper'
import createSignal from './createSignal'
import { inspect } from 'util'

const reservedProperties = ['on', 'listen', 'addEventListener', 'strict', 'format']

// the createJabr function creates a user-facing Proxy that wraps the internal PropertyMapper
function createJabr(...args) {
  const jabrOptions = parseJabrOptions(...args)
  //const { options } = jabrOptions
  const propertyMapper = new PropertyMapper(jabrOptions)

  //const eventListeners = {}
  const storeMethods = {}
  //const store = new Jabr()
  const secrets = { __args: jabrOptions }

  const validEvents = ['change', 'delete', 'set', 'assign']
  let storeProxy

  // Disabled, please return back later //if (options.hasOwnProperty('storeFormat')) sanitize(initialStore, options.storeFormat)
  storeMethods.addEventListener =
    storeMethods.on =
    storeMethods.listen =
      (prop, callback, event = 'change') => {
        if (typeof prop != 'string') throw new Error('Prop name must be a string!')
        if (typeof callback != 'function') throw new Error('Callback must be a function')
        if (typeof event != 'string' || !validEvents.includes(event))
          throw new Error(
            'Invalid event name, valid events: ' +
              validEvents.map(event => '"' + event + '"').join(', ')
          )
        if (prop === '*') {
          propertyMapper.addWildcardHandler(callback)
        } else {
          propertyMapper.getHandler(prop).emitter.on(event, callback)
        }
      }

  storeMethods.toObject = storeMethods.valueOf = () => propertyMapper.export()
  storeMethods.getSignal = prop => {
    // const set = value => (storeProxy[prop] = value)
    // const get = () => storeProxy[prop]
    // const signal = [get, set]
    // signal.__signal = true
    const signal = createSignal(storeProxy[prop])
    const [get, set, addListener] = signal
    let calledByUs = false
    storeMethods.on(prop, newValue => {
      calledByUs = true
      set(newValue)
    })
    addListener(newValue => {
      if (calledByUs) return (calledByUs = false)
      storeProxy[prop] = newValue
    })
    return signal
  }

  storeProxy = new Proxy(propertyMapper.valueMap, {
    get: (target, prop) => {
      if (typeof prop === 'symbol') return Reflect.get(propertyMapper.valueMap, prop)
      if (typeof prop !== 'string')
        throw new Error("Jabr doesn't support non string properties, got: " + inspect(prop))
      if (prop in storeMethods) {
        return storeMethods[prop] // Return the method
      }
      if (prop in secrets) {
        return secrets[prop]
      }
      if (prop.startsWith('$')) {
        // Return a Signal
        if (prop === '$') throw new Error('Must specify the prop name for signal shorthand')
        const propName = prop.substring(1)
        return storeMethods.getSignal(propName)
      }
      // TODO: THIS LINE IS BROKEN HELP LOL //if (options.strictFormat && !(prop in format)) throw new Error('Cannot access that property!')
      return propertyMapper.getHandler(prop).getValue()
    },
    set: (target, prop, value) => {
      if (typeof prop !== 'string') throw new Error('Can only assign string props')
      if (prop in storeMethods || prop in reservedProperties)
        throw new Error('Cannot assign that property!')
      const propertyHandler = propertyMapper.getHandler(prop)
      if (propertyMapper.hasProperty(prop) && propertyHandler.getValue() === value) {
        console.warn('Redundant value set, not triggering update.')
        return true
      }
      propertyHandler.setValue(value)
      return true
    },
    deleteProperty: (target, prop) => {
      if (prop in storeMethods || prop in secrets) throw new Error('Cannot delete that property!')
      propertyMapper.getHandler(prop).delete()
    },
    has: (target, prop) => {
      return propertyMapper.hasProperty(prop)
    },
    ownKeys: () => {
      return propertyMapper.getKeys() //.filter(onlyUnique) //.concat(Reflect.ownKeys(storeMethods))
    },
    getPrototypeOf: () => {
      return Jabr.prototype
    }
  })
  return storeProxy
}

export default createJabr
