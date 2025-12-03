import JabrClass from './classes/JabrClass'
import createJabr from './createJabr'
import convertFunctionToConstructor from './functions/convertFunctionToConstructor'

export default convertFunctionToConstructor(createJabr, JabrClass)
