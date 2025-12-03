export default function convertFunctionToConstructor(fn, optionalClass = null) {
  // Ensure the target is a real constructor-capable function
  function targetFunction(...args) {
    return fn.apply(this, args)
  }

  const hasValidClass =
    optionalClass && typeof optionalClass === 'function' && optionalClass.prototype

  const proxy = new Proxy(targetFunction, {
    apply(_t, thisArg, args) {
      return fn.apply(thisArg, args)
    },
    construct(_t, args) {
      // Choose a prototype:
      //   - optionalClass.prototype if valid
      //   - fn.prototype if present
      //   - Object.prototype fallback
      const proto = (hasValidClass && optionalClass.prototype) || fn.prototype || Object.prototype

      const obj = Object.create(proto)
      const result = fn.apply(obj, args)

      return result && typeof result === 'object' ? result : obj
    }
  })

  // Only apply class identity if valid constructor
  if (hasValidClass) {
    Object.setPrototypeOf(proxy, optionalClass)

    // best-effort rename (non-fatal in older engines)
    try {
      Object.defineProperty(proxy, 'name', {
        value: optionalClass.name,
        configurable: true
      })
    } catch (_) {
      /* continue regardless of error */
    }
  }

  return proxy
}
