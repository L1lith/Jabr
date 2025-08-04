import { sanitize, ANY, Format } from 'sandhands'
import { inspect } from 'util'
import Emitter from 'tiny-emitter'

const propertyConfigFormat = {
  _: {
    compute: Function,
    format: ANY,
    default: ANY,
    value: ANY,
    normalize: Function,
    validate: { _: Function, _or: [Function] },
    cacheLife: { _: Number, min: 0 }
  },
  optionalProps: ['compute', 'format', 'default', 'normalize', 'value', 'validate', 'cacheLife']
}

// The PropertyHandler handles the interactions for a single property
class PropertyHandler {
  constructor(config, mapper = null, propName) {
    PropertyHandler.validateConfig(config)
    if (mapper === null) throw new Error('Please supply the parent mapper')
    this.mapper = mapper
    this.valueMap = mapper.valueMap
    this.propName = propName
    this.config = config
    //this.changeListeners = []
    this.calculated = 'compute' in this.config
    this.doNormalize = 'normalize' in this.config
    this.doSanitize = 'format' in this.config
    this.doValidate = 'validate' in this.config
    //this.properties = this.config // TODO: WTF does this do?? lol
    //this.isMapped = this.hasOwnProperty('mapper') && this.config.hasOwnProperty('name')
    this.emitter = new Emitter()
    // We must be sure to assign .doNormalize and .doSanitize before calling the .normalizeValue method
    if ('default' in this.config) {
      if (this.calculated) throw new Error('Cannot assign a default value to a computed property')
      this.sanitizeValue(this.config.default)
    }
    if ('value' in this.config) {
      if (this.calculated) throw new Error('Cannot assign a value to a computed property')
      this.setValue(this.config.value)
    }
  }
  static normalizeConfigInput(propertyInput) {
    let output
    if (propertyInput === null) {
      output = {}
    } else if (typeof propertyInput == 'function') {
      output = { compute: propertyInput }
    } else if (propertyInput instanceof Format) {
      output = { format: propertyInput }
    } else if (typeof propertyInput == 'object' && propertyInput !== null) {
      output = { ...propertyInput }
    } else {
      throw new Error(
        'Invalid Store Property, expected a config object or another valid input or null, got ' +
          inspect(propertyInput)
      )
    }
    // if (output.hasOwnProperty('value')) throw new Error('Internal Error Unexpected State')
    return output
  }
  static validateConfig(config) {
    sanitize(config, propertyConfigFormat)
    // try {

    // } catch (error) {
    //   //console.log(config, details(config, propertyConfigFormat))
    //   throw error
    // }
  }
  normalizeValue(value) {
    return !this.doNormalize ? value : this.config.normalize(value)
  }
  sanitizeValue(value) {
    if (this.doSanitize) sanitize(value, this.config.format)
    // if (this.doValidate) {
    // }
    return true
  }
  getValue(store) {
    if (this.calculated) {
      const output = this.config.compute.apply(store)
      this.sanitizeValue(output)
      return output
    } else {
      const { propName, valueMap } = this
      return propName in valueMap ? valueMap[propName] : this.config.default
    }
  }
  setValue(value, ...args) {
    this.ensureEditable()
    value = this.normalizeValue(value)
    this.sanitizeValue(value)
    this.valueMap[this.propName] = value
    //this.changeListeners.forEach(listener => listener(value))
    this.emitter.emit('set', value, ...args)
    this.emitter.emit('change', value, 'set', ...args)
  }
  delete() {
    this.ensureEditable()
    delete this.valueMap[this.propName]
    this.emitter.emit('delete')
    this.emitter.emit('change', this.config.default, 'delete')
  }
  exists() {
    return this.propName in this.valueMap
  }
  ensureEditable() {
    if (this.calculated)
      throw new Error('Cannot edit this property, it\'s a dynamically calculated value')
  }
  onChange(handler) {
    try {
      this.ensureEditable()
    } catch (error) {
      throw new Error('Cannot assign listeners to a non-editable property.', error)
    }
    this.emitter.on('change', handler)
  }
  offChange(handler) {
    if (typeof handler !== 'function') throw new Error('Please supply a valid handler function')
    this.emitter.off('change', handler)
  }
}

export default PropertyHandler
