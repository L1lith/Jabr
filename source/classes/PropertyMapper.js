import PropertyHandler from './PropertyHandler'
import autoBind from 'auto-bind'
import onlyUnique from '../functions/onlyUnique'

// The PropertyMapper acts like the internal jabr store object
// It automates the instantiation of PropertyHandlers and the other functionality of the store
class PropertyMapper {
  constructor(jabrConfig, jabrProxy) {
    this.config = jabrConfig
    this.handlers = {}
    this.isStrict = !!this.config.options.strict
    this.valueMap = { ...this.config.valueMap }
    this.wildCards = []
    autoBind(this)
  }
  addWildcardHandler(callback) {
    if (!this.wildCards.includes(callback)) {
      this.wildCards.push(callback)
      Object.values(this.handlers).forEach(handler => {
        handler.onChange(callback)
      })
    }
  }
  getHandler(prop) {
    if (this.isStrict && !this.hasProperty(prop))
      throw new Error('That property does not exist, and the store has been flagged as strict')
    if (typeof prop != 'string') throw new Error('Must supply a string for the prop')
    if (this.handlers.hasOwnProperty(prop)) return this.handlers[prop]
    // const propertyConfig =
    //   ? this.config.properties[prop]
    //   : PropertyHandler.normalizeConfigInput({}, prop)
    let config

    if (this.config.properties.hasOwnProperty(prop)) {
      config = PropertyHandler.normalizeConfigInput(this.config.properties[prop])
    } else {
      // if (!this.isStrict)
      config = PropertyHandler.normalizeConfigInput(null)
    }
    const handler = new PropertyHandler(config, this, prop)
    this.wildCards.forEach(callback => {
      handler.onChange(callback)
    })
    this.handlers[prop] = handler
    return handler
  }
  export() {
    return { ...this.valueMap }
  }
  getKeys() {
    return Object.keys(this.valueMap)
    // return Object.entries(this.handlers)
    //   .filter(([prop, handler]) => handler.exists())
    //   .map(([prop, handler]) => prop)
    //   .concat(Object.keys(this.config.properties))
  }
  getEntries() {
    return Object.entries(this.valueMap)
  }
  hasProperty(prop) {
    return this.valueMap.hasOwnProperty(prop)
  }
}

export default PropertyMapper
