import createJabr from './functions/createJabr'
import syncToJSON from './functions/syncToJSON'
import Jabr from './classes/Jabr'

const exports = {
  createJabr,
  Jabr: new Proxy(Jabr, { construct: (target, args) => createJabr(...args) }),
  syncToJSON
}

export default Object.freeze(exports)
