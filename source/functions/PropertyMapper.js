import PropertyHandler from './PropertyHandler'
import autoBind from 'auto-bind'

class PropertyMapper {
  constructor(jabrConfig, jabrProxy) {
    this.config = jabrConfig
    this.handlers = {}
    this.isStrict = !!this.config.options.strict
    this.properties = Object.keys(this.config.properties).map(property =>
      this.config.properties[property].hasOwnProperty('value')
    )
    autoBind(this)
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
      config = PropertyHandler.normalizeConfigInput(this.config.properties[prop], prop)
    } else {
      // if (!this.isStrict)
      config = PropertyHandler.normalizeConfigInput(null, prop)
    }
    const handler = new PropertyHandler(config, this)
    this.handlers[prop] = handler
    return handler
  }
  getKeys() {
    return this.properties
    // return Object.entries(this.handlers)
    //   .filter(([prop, handler]) => handler.exists())
    //   .map(([prop, handler]) => prop)
    //   .concat(Object.keys(this.config.properties))
  }
  getEntries() {
    return Object.entries(this.handlers)
      .filter(([prop, handler]) => handler.exists())
      .map(([prop, handler]) => prop)
  }
  hasProperty(prop) {
    return this.properties.includes(prop)
  }
  addToPropsList(prop) {
    if (!this.properties.includes(prop)) {
      this.properties.push(prop)
      return true
    } else {
      return false
    }
  }
  removeFromPropsList(prop) {
    if (this.properties.includes(prop)) {
      this.properties = this.properties.filter(value => prop !== value)
      return true
    } else {
      return false
    }
  }
}

export default PropertyMapper
