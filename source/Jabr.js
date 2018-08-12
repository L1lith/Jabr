const autoBind = require('auto-bind')
const pathArguments = require('./functions/pathArguments')

class Jabr {
  constructor() {
    this.store = {}
    this.listeners = {}
    autoBind(this)
  }
  set() {
    if (arguments.length < 2) throw new Error('Missing Value Argument')
    const path = pathArguments(arguments)
    let target = this.store

    const value = arguments[arguments.length - 1]
    target[path[path.length - 1]] = value
    this.getListeners(path).forEach(listener => {
      listener(value, path)
    })
  }
  addListener() {
    const path = pathArguments(arguments)
    const listener = arguments[arguments.length - 1]
    if (typeof listener != 'function') throw new Error('Change Listener Must be a Function')
    const listeners = this.getListeners(path)
    if (!listeners.includes(listener)) listeners.push(listener)
  }
  removeListener() {
    const path = pathArguments(arguments)
    const listener = arguments[arguments.length - 1]
    if (typeof listener != 'function') throw new Error('Change Listener Must be a Function')
    const listeners = this.getListeners(path)
    const listenerIndex = listeners.indexOf(listener)
    if (listenerIndex > -1) listeners.splice(listenerIndex, 1)
  }
  getListeners(path) {
    let target = this.listeners
    path.forEach((pathArg, index) => {
      if (!target.hasOwnProperty('children')) target.children = {}
      if (!target.children.hasOwnProperty(pathArg)) target.children[pathArg] = {}
      target = target.children[pathArg]
    })
    if (!target.hasOwnProperty('listeners')) target.listeners = []
    return target.listeners
  }
}
