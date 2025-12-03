import SignalClass from './classes/SignalClass'
import createSignal from './createSignal'
import convertFunctionToConstructor from './functions/convertFunctionToConstructor'

export default convertFunctionToConstructor(createSignal, SignalClass)
