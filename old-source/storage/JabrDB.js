import { MongoClient } from 'mongodb'
import { sanitize, valid } from 'sandhands'
import once from 'underscore/once'
import autoBind from 'auto-bind'
import Jabr from '../../source/Jabr'

const URIFormat = {
  _: String,
  regex: /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\w+?)(:(\d+))?\/(\w+?)$/
}

const connectionFormat = [
  {
    _: URIFormat,
    _or: {
      _: {
        uri: URIFormat,
        autoReconnect: Boolean,
        reconnectTries: {
          _: Number,
          integer: true,
          min: 0
        },
        useNewUrlParser: Boolean
      },
      optionalProps: ['autoReconnect', 'reconnectTries', 'useNewUrlParser']
    }
  }
]

const defaultConnectionArgs = {
  useNewUrlParser: true
}

const optionsFormat = {
  _: {
    db: String
  },
  allOptional: true
}

const defaultOptions = {
  db: 'jabr'
}

class JabrDB {
  constructor(options = {}) {
    sanitize(options, optionsFormat)
    autoBind(this)
    this._options = Object.freeze({ ...defaultOptions, ...options })
    this.reset()
    process.on('SIGINT', this.reset)
    process.on('SIGTERM', this.reset)
  }
  async reset() {
    if (
      this.hasOwnProperty('_client') &&
      typeof this._client == 'object' &&
      this._client !== null
    ) {
      await this._client.close()
    }
    this._client = null
    this.setup = once(this._doSetup)
    this._setupCalled = false
  }
  async _doSetup(connectionArgs) {
    if (this._setupCalled)
      throw new Error(
        'The setup function has already been called, please make a new instance or use the .reset() method'
      )
    if (!connectionArgs) throw new Error('Must supply the connection arguments')
    sanitize(connectionArgs, connectionFormat)
    this._setupCalled = true
    let connectionURI
    if (typeof connectionArgs == 'string') {
      connectionURI = connectionArgs
      connectionArgs = { ...defaultConnectionArgs }
    } else {
      connectionURI = connectionArgs.uri
      connectionArgs = { ...defaultConnectionArgs, ...connectionArgs }
      delete connectionArgs.uri
    }
    this._client = new MongoClient(connectionURI, connectionArgs)
    await this._client.connect()
    this._db = this._client.db(this._options.db)
  }
  async syncToDB(jabr, collectionName) {
    if (!valid(collectionName, String))
      throw new Error('Must supply a collection name as the second argument')
    if (!(jabr instanceof Jabr)) throw new Error('Expected a Jabr instance')
    await this.ensureConnected()
    await this._db.open()
    const collection = this._db.collection(collectionName)
  }
  isConnected() {
    return !!this._client?.topology && this._client.topology.isConnected()
  }
  async ensureConnected() {
    if (!this._setupCalled) throw new Error('The setup function has not been called')
    await this.setup()
    if (!this.isConnected()) throw new Error('The MongoDB Connection has been lost')
  }
}

export default JabrDB
