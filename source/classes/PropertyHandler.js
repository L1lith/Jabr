import { sanitize, ANY, Format, details } from 'sandhands'
import { inspect } from 'util'
import Emitter from 'tiny-emitter'

// const propertyConfigFormat = {
//   _: {},
//   standard: {
//     _: {
//       name: String,
//       compute: Function,
//       format: ANY,
//       default: ANY,
//       value: ANY,
//       normalize: Function
//     },
//     optionalProps: ['compute', 'format', 'default', 'normalize', 'value']
//   },
//   strict: false
// }

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

class PropertyHandler {
  constructor(config, mapper = null, propName) {
    PropertyHandler.validateConfig(config)
    if (mapper === null) throw new Error('Please supply the parent mapper')
    this.mapper = mapper
    this.valueMap = mapper.valueMap
    this.propName = propName
    this.config = config
    this.changeListeners = []
    this.calculated = this.config.hasOwnProperty('compute')
    console.log(this.config, this.calculated)
    this.doNormalize = this.config.hasOwnProperty('normalize')
    this.doSanitize = this.config.hasOwnProperty('format')
    this.doValidate = this.config.hasOwnProperty('validate')
    //this.properties = this.config // TODO: WTF does this do?? lol
    //this.isMapped = this.hasOwnProperty('mapper') && this.config.hasOwnProperty('name')
    this.emitter = new Emitter()
    // We must be sure to assign .doNormalize and .doSanitize before calling the .normalizeValue method
    if (this.config.hasOwnProperty('default')) {
      if (this.calculated) throw new Error('Cannot assign a default value to a computed property')
      this.sanitizeValue(this.config.default)
    }
    if (this.config.hasOwnProperty('value')) {
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
    try {
      sanitize(config, propertyConfigFormat)
    } catch (error) {
      console.log(config, details(config, propertyConfigFormat))
      throw error
    }
  }
  normalizeValue(value) {
    return !this.doNormalize ? value : this.config.normalize(value)
  }
  sanitizeValue(value) {
    if (this.doSanitize) sanitize(value, this.config.format)
    if (this.doValidate) {
    }
    return true
  }
  getValue(store) {
    console.log(this.config, this.calculated)
    if (this.calculated) {
      const output = this.config.compute.apply(store)
      this.sanitizeValue(output)
      return output
    } else {
      const { propName, valueMap } = this
      return valueMap.hasOwnProperty(propName) ? valueMap[propName] : this.config.default
    }
  }
  setValue(value) {
    this.ensureEditable()
    value = this.normalizeValue(value)
    this.sanitizeValue(value)
    this.valueMap[this.propName] = value
    this.changeListeners.forEach(listener => listener(value))
    this.emitter.emit('set', value)
    this.emitter.emit('change', value, 'set')
  }
  delete() {
    this.ensureEditable()
    delete this.valueMap[this.propName]
    this.emitter.emit('delete')
    this.emitter.emit('change', this.config.default, 'delete')
  }
  exists() {
    return this.valueMap.hasOwnProperty(this.propName)
  }
  ensureEditable() {
    if (this.calculated)
      throw new Error("Cannot edit this property, it's a dynamically calculated value")
  }
  onChange(handler) {
    try {
      this.ensureEditable()
    } catch (error) {
      throw new Error('Cannot assign listeners to a non-editable property.')
    }
    this.emitter.on('change', handler)
  }
  offChange(handler) {
    if (typeof handler !== 'function') throw new Error('Please supply a valid handler function')
    this.emitter.off('change', handler)
  }
}

export default PropertyHandler
