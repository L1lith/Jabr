import { sanitize } from 'sandhands'

const optionsFormat = {
  _: {
    strict: Boolean
  },
  allOptional: true
}

// Interprets and validates the arguments passed to the createJabr functionf
function parseJabrOptions(valueMap = {}, propertyOptions = {}, inputOptions = {}) {
  if (inputOptions === null) {
    inputOptions = {}
  } else if (typeof inputOptions != 'object') {
    throw new Error('The options must be an object')
  } else {
    inputOptions = { ...inputOptions }
  }
  let options = { ...inputOptions }
  if (valueMap === null) {
    valueMap = {}
  } else if (typeof valueMap != 'object') {
    throw new Error('The value map must be an object')
  } else {
    valueMap = { ...valueMap }
  }
  let properties = {}
  if (propertyOptions === null) {
    propertyOptions = {}
  } else if (typeof propertyOptions != 'object') {
    throw new Error('The property options map must be an object')
  } else {
    propertyOptions = { ...propertyOptions }
    Object.entries(propertyOptions).forEach(([prop, config]) => {
      if (config === null) return {}
      if (typeof prop !== 'string') throw new Error('All props must be strings')
      if (prop === '_') {
        const newOptions = propertyOptions[prop]
        if (typeof newOptions !== 'object' || newOptions === null)
          throw new Error('The _ property must be an object of options')
        options = { ...newOptions, ...options }
      } else if (prop.startsWith('_')) {
        options[prop.substring(1)] = propertyOptions[prop]
      } else {
        properties[prop] = propertyOptions[prop]
      }
      const hasValue = typeof config == 'object' && config.hasOwnProperty('value')
      if (config.hasOwnProperty('compute') && (hasValue || valueMap.hasOwnProperty(prop))) {
        throw new Error('Cannot both assign a value and provide a compute function')
      }
      if (typeof config == 'object' && hasValue) {
        valueMap[prop] = config.value
        delete config.value
      }
    })
  }

  sanitize(options, optionsFormat)
  return { options, properties, valueMap }
}

// function setPropertyOptions(propertyMap, property, options = {}) {
//   if (typeof property != 'string' || property.length < 1) {
//     throw new Error('Invalid ')
//   }
//   if (!propertyMap.hasOwnProperty(property)) propertyMap[property] = {}
//   const options = propertyMap[property]
//   if (typeof options != 'object' || options === null)
//     throw new Error('Expected to get an object for the property options')
// }

export default parseJabrOptions
