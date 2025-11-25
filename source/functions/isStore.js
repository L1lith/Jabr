export default function isStore(value) {
  return typeof value == 'object' && value !== null && value.__isJabrStore === true
}
