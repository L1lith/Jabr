import Jabr from '../classes/Jabr'
import { sanitize, Format } from 'sandhands'
import onlyUnique from './onlyUnique'
import parseJabrOptions from './parseJabrOptions'
import PropertyMapper from '../classes/PropertyMapper'
import deepEqual from 'deep-equal'

const reservedProperties = ['on', 'listen', 'addEventListener', 'strict', 'format']

function createJabr(...args) {
  const jabrOptions = parseJabrOptions(...args)
  const { options } = jabrOptions
  const propertyMapper = new PropertyMapper(jabrOptions)

  const eventListeners = {}
  const storeMethods = {}
  const store = new Jabr()
  const secrets = { __args: jabrOptions }

  const validEvents = ['change', 'delete', 'set']

  // Disabled, please return back later //if (options.hasOwnProperty('storeFormat')) sanitize(initialStore, options.storeFormat)
  storeMethods.addEventListener = storeMethods.on = storeMethods.listen = (
    prop,
    callback,
    event = 'change'
  ) => {
    if (typeof prop != 'string') throw new Error('Prop name must be a string!')
    if (typeof callback != 'function') throw new Error('Callback must be a function')
    if (typeof event != 'string' || !validEvents.includes(event))
      throw new Error(
        'Invalid event name, valid events: ' +
          validEvents.map(event => '"' + event + '"').join(', ')
      )
    return propertyMapper.getHandler(prop).emitter.on(event, callback)
  }

  const storeProxy = new Proxy(store, {
    get: (target, prop) => {
      if (typeof prop !== 'string') return Reflect.get(store, prop)
      if (storeMethods.hasOwnProperty(prop)) {
        return storeMethods[prop] // Return the method
      }
      if (secrets.hasOwnProperty(prop)) {
        return secrets[prop]
      }
      if (options.strictFormat && !format.hasOwnProperty(prop))
        throw new Error('Cannot access that property!')
      return propertyMapper.getHandler(prop).getValue()
    },
    set: (target, prop, value) => {
      if (typeof prop !== 'string') throw new Error('Can only assign string props')
      if (storeMethods.hasOwnProperty(prop) || reservedProperties.hasOwnProperty(prop))
        throw new Error('Cannot assign that property!')
      const propertyHandler = propertyMapper.getHandler(prop)
      if (propertyMapper.hasProperty(prop) && deepEqual(propertyHandler.getValue(), value))
        return console.warn('Redundant value set, not triggering update.')
      propertyHandler.setValue(value)
      return true
    },
    deleteProperty: (target, prop) => {
      if (storeMethods.hasOwnProperty(prop)) throw new Error('Cannot delete that property!')
      propertyMapper.getHandler(prop).delete()
    },
    has: (target, prop) => {
      return prop in storeMethods || propertyMapper.getHandler(prop).exists()
    },
    ownKeys: () => {
      return propertyMapper.getKeys().concat(Reflect.ownKeys(storeMethods)).filter(onlyUnique)
    },
    getPrototypeOf: () => {
      return Jabr.prototype
    }
  })
  return storeProxy
}

export default createJabr
