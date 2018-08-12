const {Component} = require('react')
const createJabr = require('../source/jabrProxy')
const Jabr = require('../source/Jabr')

class Jabr extends Component {
  constructor(jabrStore) {
    if (jabrStore === undefined) {
      this.jabrStore = createJabr()
    } else if (jabrStore instanceof Jabr) {
      this.jabrStore = Jabr
    } else {
      throw new Error("You must supply a Jabr instance")
    }
  }
  render() {

  }
}
