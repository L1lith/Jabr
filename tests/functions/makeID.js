const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const charactersLength = characters.length

function makeID(length = 5) {
  length = Math.max(length, 1)
  var result = ''
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return 'PROPERTY_ID_' + result
}

module.exports = makeID
