import Jabr from './Jabr'

const reservedProperties = ["on", "listen"]

function createJabr(initialStore={}) {
  const store = Object.assign(new Jabr(), initialStore)

  const eventListeners = {}
  const storeMethods = {}

  storeMethods.addEventListener = storeMethods.on = storeMethods.listen = (prop, callback) => {
    if (typeof prop != 'string') throw new Error("Prop name must be a non-empty string!")
    if (typeof callback != 'function') throw new Error("Callback must be a function")
    if (storeMethods.hasOwnProperty(prop)) throw new Error("Cannot listen to that property!")
    if (!eventListeners.hasOwnProperty(prop)) eventListeners[prop] = []
    const ourEventListeners = eventListeners[prop]
    if (!ourEventListeners.includes(callback)) ourEventListeners.push(callback)
  }

  return new Proxy(store, {
    get: (target, prop) => {
      if (storeMethods.hasOwnProperty(prop)) return storeMethods[prop]
      return store[prop]
    },
    set: (target, prop, value) => {
      if (storeMethods.hasOwnProperty(prop)) throw new Error("Cannot assign that property!")
      store[prop] = value
      if (eventListeners.hasOwnProperty(prop)) {
        eventListeners[prop].forEach(listener => {
          try {
            listener(value)
          } catch(error) {
            console.error(error)
          }
        })
      }
      return true
    },
    deleteProperty: (target, prop) => {
      if (storeMethods.hasOwnProperty(prop)) throw new Error("Cannot delete that property!")
      delete store[prop]
      console.log(eventListeners, prop)
      if (eventListeners.hasOwnProperty(prop)) {
        eventListeners[prop].forEach(listener => {
          try {
            listener(undefined)
          } catch(error) {
            console.error(error)
          }
        })
      }
      return true
    },
    has: (target, prop) => {
      return (prop in storeMethods) || (prop in store)
    },
    ownKeys: () => {
      return Reflect.ownKeys(store).concat(Reflect.ownKeys(storeMethods))
    }
  })
}

export default createJabr
