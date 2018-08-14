const autoBind = require('auto-bind')
const pathArguments = require('./functions/pathArguments')

class Jabr {
  constructor(initialStore={}) {
    if (typeof initialStore != 'object' || initialStore === null) throw new Error("The initial store must be an object")
    if (Object.isFrozen(initialStore)) throw new Error('The initial store cannot be frozen')
    this.store = initialStore
    this.listeners = {listeners: []}
    autoBind(this)
  }
  set() {
    if (arguments.length < 2) throw new Error('Missing Value Argument')
    const path = pathArguments(arguments)
    let target = this.store
    path.forEach((pathArg, index) => {
      if (index < path.length - 1) {
        if (!target.hasOwnProperty(pathArg)) {
          target[pathArg] = {}
        } else if (typeof target[pathArg] != 'object' || target[pathArg] === null) throw new Error(`Path "${pathArg}" Not an Object`)
        target = target[pathArg]
      }
    })

    const value = arguments[arguments.length - 1]
    target[path[path.length - 1]] = value
    this.getListeners(path).forEach(listener => {
      listener(value, path)
    })
  }
  addListener() {
    const path = pathArguments(arguments, 1, 0)
    const listener = arguments[arguments.length - 1]
    if (typeof listener != 'function') throw new Error('Change Listener Must be a Function')
    let target = this.listeners

    path.forEach((pathArg, index) => {
      if (!target.hasOwnProperty('children')) target.children = {}
      if (!target.children.hasOwnProperty(pathArg)) target.children[pathArg] = {}
      target = target.children[pathArg]
      if (!target.hasOwnProperty('listeners')) target.listeners = []
    })
    target.listeners.push(listener)
  }
  removeListener() {
    const path = pathArguments(arguments)
    const listener = arguments[arguments.length - 1]
    if (typeof listener != 'function') throw new Error('Change Listener Must be a Function')

    let target = this.listeners

    path.forEach((pathArg, index) => {
      if (!target.hasOwnProperty('children')) target.children = {}
      if (!target.children.hasOwnProperty(pathArg)) target.children[pathArg] = {}
      target = target.children[pathArg]
      if (!target.hasOwnProperty('listeners')) target.listeners = []
      const {listeners} = target
      const listenerIndex = listeners.indexOf(listener)
      if (listenerIndex > -1) listeners.splice(listenerIndex, 1)
    })

    const {listeners} = this
    const listenerIndex = listeners.indexOf(listener)
    if (listenerIndex > -1) listeners.splice(listenerIndex, 1)
  }
  getListeners(path) {
    let target = this.listeners
    let listeners = this.listeners.listeners
    path.forEach((pathArg, index) => {
      if (!target.hasOwnProperty('children')) target.children = {}
      if (!target.children.hasOwnProperty(pathArg)) target.children[pathArg] = {}
      target = target.children[pathArg]
      if (!target.hasOwnProperty('listeners')) target.listeners = []

      listeners = listeners.concat(target.listeners)
    })
    return listeners
  }
  get() {
    const path = pathArguments(arguments, 0)
    let target = this.store
    path.forEach(pathArg => {
      //if (!target.hasOwnProperty(pathArg)) target[pathArg] = {}
      target = target[pathArg]
    })
    return target
  }
  keys() {
    const path = pathArguments(arguments, 0, 0)
    let target = this.store
    path.forEach(pathArg => {
      target = target[pathArg]
      if (typeof target != 'object' || target === null) throw new Error("Target is not an object")
    })
    return Reflect.ownKeys(target)
  }
  has() {
    const path = pathArguments(arguments, 1, 0)
    const prop = arguments[arguments.length - 1]
    if (typeof prop != 'string') throw new Error('Target prop must be a string')
    let target = this.store
    path.forEach((pathArg, index) => {
      if (index < path.length - 1) {
        target = target[pathArg]
        if (typeof target != 'object' || target === null) throw new Error("Target is not an object")
      }
    })
    return target.hasOwnProperty(prop)
  }
  delete() {
    const path = pathArguments(arguments, 0)
    let target = this.store
    path.forEach((pathArg, index) => {
      if (index < path.length - 1) {
        target = target[pathArg]
        if (typeof target != 'object' || target === null) throw new Error("Target is not an object")
      }
    })
    delete target[path[path.length - 1]]
    this.getListeners(path).forEach(listener => listener(undefined, path))
  }
}

module.exports = Jabr
