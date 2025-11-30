No-nonsense State Management! No more boilerplate hell :) Now supports stores and signals! This library is entirely framework agnostic.

## Signal Basics
Signals are pretty standard to how they exist in other libraries, except they also provide the addListener and removeListener methods.

```js
import {Signal} from 'jabr'
const [get, set, addListener, removeListener] = new Signal(52/* Initial value*/)

console.log(get()) // logs 52
set(7)
console.log(get()) // logs 7

const ourListener = (newValue, oldValue) => {
	console.log('New Value: ' + newValue)
	console.log('Old Value: ' + oldValue)
}

addListener(ourListener)

set(8) // Now our listener is called, logging our old and new values

removeListener(ourListener)

set(9) // Nothing happens because we removed our listener
```

## Signals: Property Access and Object Destructuring Syntax
We can also just use our signal like a normal variable using the property access. We can also use the object destructuring syntax, which has some benefits over the array destructuring syntax like the ".self" property (which allows us to create a reference to our signal object). Here's a demo of the object destructuring syntax:
```js
const {get: getColor, set: setColor, addListener: addColorListener, self: colorSignal} = new Signal('blue')

addColorListener(color => {
	console.log("Got a new color!:", color)
})

setColor('green') // Logs "Got a new color!: green"
getColor() // returns "green"
```

Now we can pass around our signal to other parts of our code without needing to break up our declaration into multiple lines (by first declaring the signal variable and then destructuring it after). The list of properties are: `.get, .set, .addListener, .removeListener, and .self`. Another benefit of this syntax compared to array destructuring is that it's not based on the order that you declare your variables, and it's future proof as new properties and methods are added to the signal object.

## Store Basics

Store stores are very simple, first we create a store object.

```js
import {Store} from 'jabr'
const store = new Store()
```

This store object is used just like any other object in Javascript. We can read and modify properties without any special methods.

```js
store.a = 12
console.log(store) // Logs 12
```

#### Store Event Listeners

Now the magic* here is that we can attach listeners to our store. Whenever we modify the store our callback function is called with the new data. Let's look at an example:

```js
store.on('a', value => {
	console.log(value)
})
store.a = 12 // Logs 12
```

You can listen to all properties by supplying `*` instead of the property name. Store triggers the callback function without requiring us to call any methods. It does this by using the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) under the hood, but you don't need to worry about that unless your runtime doesn't support it (all modern Javascript Environments do).

### Initializing the Store

We can intialize our store by supplying it with an object in the constructor.

```js
import {Store} from 'jabr'
const store = new Store({b: "Long John Silvers"})

console.log(store.b) // Logs "Long John Silvers"
```

### Getting Signals from our Store
Our store can automatically generate signals for us for any given property using the `.getSignal` method

```js
import {Store} from 'jabr'
const store = new Store({b: "Long John Silvers"})

console.log(store.getSignal('b')) // returns a Signal object that always syncs with our store's 'b' property.
```

You can also use $ followed by the property name as a syntactical shorthand:

```js
import {Store} from 'jabr'
const store = new Store({b: "Long John Silvers"})

console.log(store.$b) // returns a Signal object that always syncs with our store's 'b' property.
```

#### Configuring Property Options

You can pass additional options for each store property by passing a map of option objects for each property. There are a number of features you can supply, including data validation using Sandhands formats, normalization, and more

##### format

The format option can be used to ensure your data is properly formatted

```js
import {Store} from 'jabr'
const store = new Store({age: 37}, {age: {format: Number}}) // Our store will now throw an error if we attempt to make age anything besides a number (it can still be deleted)
```

#### compute

Passing a function as the compute option will allow you to create a property whose value is computed on the fly.

```js
import {Store} from 'jabr'
const store = new Store({}, {random: {compute: ()=>Math.random()}})
console.log(store.random) // Returns a new random value every time it is accessed
```

Properties that are computed on the fly cannot be assigned and do not trigger callbacks

##### default

When the default option is provided, if our property does not have a value currently and we access it the default value will be returned

# Synchronizing store to JSON file

We can use the syncToJSON method in order to synchronously save our store to a JSON file. It will also read any existing values in the JSON file.

```js
import {Store, syncToJSON} from 'jabr'
const store = new Store()
syncToJSON(store, 'data.json') // Loads any existing data in data.json (if it exists), overwriting any conflicting properties in the store
store.snack = "cookie" // Synchronously saves this data to the data.json file when we modify the store
```

# A note about the magic*
As a rule I tend to dislike "magic" in programming. I think this is what makes Ruby on Rails so confusing. All of the functionality in this library is based on [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), and I have designed it in a way to be as simple as possible to use and to read my code. I am still sticking to the functional programming paradigm to ensure that my projects avoid bugs & overcomplication. I'd recommend reading more about functional programming, or [checking out this projects small and concise source code](https://github.com/L1lith/Store) (warning: it won't make sense until you learn about proxies, but they are a relatively simple extension of functional programming).