import JabrClass from './classes/JabrClass'
import createJabr from './functions/createJabr'

export default new Proxy(JabrClass, { construct: (target, args) => createJabr(...args) })
