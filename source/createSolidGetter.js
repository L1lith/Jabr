import { createSignal } from 'solid-js'
import { from } from 'solid-js'

export default function createSolidGetter(jabrSignal) {
  return from(
    set => {
      // Subscribe to the jabr signal and update the Solid signal on changes
      const changeListener = newValue => {
        set(newValue)
      }
      jabrSignal.addListener(changeListener)

      // Return the cleanup function to unsubscribe
      return () => jabrSignal.removeListener(changeListener)
    },
    jabrSignal.get() // Use current value from jabr signal as initial value
  )
}
