import createJabr from './functions/createJabr'
import JabrClass from './Jabr'
export { default as createJabr } from './functions/createJabr'
export { default as syncToJSON } from './functions/syncToJSON'
export const Jabr = new Proxy(JabrClass, { construct: (target, args) => createJabr(...args) })
