# Jabr


## Basics
Jabr is very simple, first we create a store object.
```js
const Jabr = require('jabr')
const store = new Jabr()
```
This store object is used just like any other object in Javascript. We can read and modify properties without any special methods.
```js
store.a = 12
console.log(store) // Logs 12
```
Now as mind blowing as that is the magic here is that we can attach listeners to our store. Whenever we  modify  the store our callback function is called with the new data. Let's look at an example
```js
store.on('a', value => {
	console.log(value)
})
store.a = 12 // Logs 12
```
Jabr triggers the callback function without requiring us to call any methods. It does this by using the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) under the hood, but you don't need to worry about that unless your runtime doesn't support it.

## More
#### Initializing the Store
We can intialize our store by supplying it with an object in the constructor.
```js
const Jabr = require('jabr')
const store = new Jabr({b: "Long John Silvers"})

console.log(store.b) // Logs "Long John Silvers"
```

## React
Jabr supports React using the `"jabr-react"` package found [here](https://github.com/L1lith/Jabr-React).
