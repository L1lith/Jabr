import JabrClass from './classes/JabrClass'
import createJabr from './createJabr'

export default new Proxy(JabrClass, { construct: (target, args) => createJabr(...args) })
