import Jabr from './Jabr'
import { sanitize, Format } from 'sandhands'

const reservedProperties = ['on', 'listen', 'addEventListener', 'strict', 'format']

const storeFormat = Format(Object).nullable().strict(false)

const optionsFormat = Format({
  computedProperties: Format(Object).nullable().standard(Function),
  format: Format({ strict: Boolean }).strict(false).nullable()
}).allOptional()

function createJabr(initialStore = {}, options = {}) {
  sanitize(initialStore, storeFormat)
  const store = Object.assign(new Jabr(), initialStore || {})
  sanitize(options, optionsFormat)
  if (options === null) {
    options = {}
  }

  const eventListeners = {}
  const storeMethods = {}
  const computedProperties = options.computedProperties || {}
  const format = options.format || {}
  const strictFormat = format.hasOwnProperty('strict')
    ? strictFormat
    : options.hasOwnProperty('format')
  delete format.strict

  storeMethods.addEventListener = storeMethods.on = storeMethods.listen = (prop, callback) => {
    if (typeof prop != 'string') throw new Error('Prop name must be a non-empty string!')
    if (typeof callback != 'function') throw new Error('Callback must be a function')
    if (storeMethods.hasOwnProperty(prop)) throw new Error('Cannot listen to that property!')
    if (!eventListeners.hasOwnProperty(prop)) eventListeners[prop] = []
    const ourEventListeners = eventListeners[prop]
    if (!ourEventListeners.includes(callback)) ourEventListeners.push(callback)
  }

  return new Proxy(store, {
    get: (target, prop) => {
      if (strictFormat && !format.hasOwnProperty(prop))
        throw new Error('Cannot access that property!')
      if (computedProperties.hasOwnProperty(prop)) {
        const output = computedProperties[prop].apply(store)
        if (format.hasOwnProperty(prop)) sanitize(output, format[prop]) // Sanitize Computed Values
        return output
      }
      if (storeMethods.hasOwnProperty(prop)) return storeMethods[prop]
      return store[prop]
    },
    set: (target, prop, value) => {
      if (
        storeMethods.hasOwnProperty(prop) ||
        computedProperties.hasOwnProperty(prop) ||
        reservedProperties.hasOwnProperty(prop)
      )
        throw new Error('Cannot assign that property!')
      if (format.hasOwnProperty(prop)) {
        sanitize(value, format[prop]) // Sanitize values before assigning them
      } else if (strictFormat) {
        throw new Error(`Property "${prop}" is not allowed`)
      }
      store[prop] = value
      if (eventListeners.hasOwnProperty(prop)) {
        eventListeners[prop].forEach(listener => {
          try {
            listener(value)
          } catch (error) {
            console.error(error)
          }
        })
      }
      return true
    },
    deleteProperty: (target, prop) => {
      if (storeMethods.hasOwnProperty(prop)) throw new Error('Cannot delete that property!')
      delete store[prop]
      if (eventListeners.hasOwnProperty(prop)) {
        eventListeners[prop].forEach(listener => {
          try {
            listener(undefined)
          } catch (error) {
            console.error(error)
          }
        })
      }
      return true
    },
    has: (target, prop) => {
      return prop in storeMethods || prop in store
    },
    ownKeys: () => {
      return Reflect.ownKeys(store).concat(Reflect.ownKeys(storeMethods))
    }
  })
}

export default createJabr
