import { sanitize } from 'sandhands'

const optionsFormat = {
  _: {
    strict: Boolean
  },
  allOptional: true
}

function parseJabrOptions(valueMap = {}, propertyOptions = {}, inputOptions = {}) {
  if (valueMap === null) {
    valueMap = {}
  } else if (typeof valueMap != 'object') {
    throw new Error('The value map must be an object')
  }
  if (valueMap === null) {
    valueMap = {}
  } else if (typeof valueMap != 'object') {
    throw new Error('The property options map must be an object')
  }
  if (inputOptions === null) {
    inputOptions = {}
  } else if (typeof inputOptions != 'object') {
    throw new Error('The options must be an object')
  }
  let options = { ...inputOptions }
  const properties = {}
  Object.keys(propertyOptions).forEach(prop => {
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
  })
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
