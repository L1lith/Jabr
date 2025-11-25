import SignalClass from './classes/SignalClass'
import createSignal from './createSignal'

export default new Proxy(SignalClass, { construct: (target, args) => createSignal(...args) })
