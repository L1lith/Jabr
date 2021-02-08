import createJabr from './createJabr'

export default new Proxy(createJabr, {
  set: () => {
    throw new Error('Cannot overwrite the library')
  },
  get: () => {
    return undefined
  },
  setPrototypeOf: () => {
    throw new Error('Cannot overwrite the library')
  },
  isExtensible: () => false,
  deleteProperty: () => {
    throw new Error('Cannot overwrite the library')
  },
  construct: (target, args) => {
    return createJabr(...args)
  }
})
