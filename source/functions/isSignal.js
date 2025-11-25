export default function isSignal(value) {
  return typeof value == 'object' && value !== null && value.__isJabrSignal === true
}
