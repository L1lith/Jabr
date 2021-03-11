import { sanitize } from 'sandhands'

const optionsFormat = {
  _: {
    strict: Boolean
  },
  allOptional: true
}

function parseJabrOptions(valueMap = {}, propertyOptions = {}, inputOptions = {}) {
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
      if (valueMap.hasOwnProperty(prop)) properties[prop].value = valueMap[prop]
    }
  })
  sanitize(options, optionsFormat)
  return { options, properties }
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