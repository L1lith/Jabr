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
    name: String,
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
  constructor(config, mapper = null) {
    PropertyHandler.validateConfig(config)
    if (mapper !== null) this.mapper = mapper
    this.config = config
    this.changeListeners = []
    this.calculated = this.config.hasOwnProperty('compute')
    this.doNormalize = this.config.hasOwnProperty('normalize')
    this.doSanitize = this.config.hasOwnProperty('format')
    this.doValidate = this.config.hasOwnProperty('validate')
    this.properties = this.config // TODO: WTF does this do?? lol
    this.isMapped = this.hasOwnProperty('mapper') && this.config.hasOwnProperty('name')
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
  static normalizeConfigInput(propertyInput, propertyName, valueMap) {
    if (typeof propertyName != 'string') throw new Error('Must supply a property name')
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
        'Invalid Store Property, expected a config object or another valid input, got ' +
          inspect(propertyInput)
      )
    }
    if (valueMap.hasOwnProperty(propertyName)) {
      if (output.hasOwnProperty('value')) throw new Error('Cannot double assign the value')
      output.value = valueMap[propertyName]
    }
    output.name = propertyName
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
    if (this.calculated) {
      const output = this.config.compute.apply(store)
      this.sanitizeValue(output)
      return output
    } else {
      return this.hasOwnProperty('value') ? this.value : this.config.default
    }
  }
  setValue(value) {
    this.ensureEditable()
    value = this.normalizeValue(value)
    this.sanitizeValue(value)
    if (this.isMapped) this.mapper.addToPropsList(this.config.name)
    this.value = value
    this.changeListeners.forEach(listener => listener(value))
    this.emitter.emit('set', value)
    this.emitter.emit('change', value, 'set')
  }
  delete() {
    this.ensureEditable()
    delete this.value
    if (this.isMapped) this.mapper.removeFromPropsList(this.config.name)
    this.emitter.emit('delete')
    this.emitter.emit('change', this.config.default, 'delete')
  }
  exists() {
    return this.hasOwnProperty('value') || this.config.hasOwnProperty('default')
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
