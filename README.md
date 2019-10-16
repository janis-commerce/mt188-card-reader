# MT188 Card Reader

---

# Installation

```sh
npm install @janiscommerce/mt188-card-reader
```

---

# API

## MT188CardReader

### async getPAN(options)
Gets the card's PAN (card number and expiration date). It handles magnetic card, chip card and contactless

**Parameters**

* **options** *Object*
* | **options.contactless**: *Boolean* Indicates whether the card is contactles or not. Default: `false`
* | **options.clearMagneticCardBuffer**: *Boolean* Indicates whether to clear the magnetic band card buffer before reading. Default: `false`

**Returns** *Object* with `cardNumber`, `expirationMonth` and `expirationYear` properties.

**Throws** *MT188CardReaderError* in case of error

### getPANWithRetries(options)
Gets the card's PAN (card number and expiration date). It handles magnetic card, chip card and contactless
By default, it makes 20 attempts to read the PAN with an interval of 1 second.

**Parameters**

* **options** *Object* -- *Extends the options of `getPAN()`
* | **options.maxAttempts**: *Number* The max quantity of attempts to get the card's PAN. Default: `20`

**Returns** *Promise* Resolves with `getPan()` return value or rejects with a `MT188CardReaderError` Error

---

# Usage

```js
const { MT188CardReader } = require('@janiscommerce/mt188-card-reader');

MT188CardReader.getPan({ contactless: false })
	.then(pan => {
		console.log(pan);
	})
	.catch(e => {
		console.error(e);
	});

// Or

MT188CardReader.getPANWithRetries({ contactless: false, maxAttempts: 10 })
	.then(pan => {
		console.log(pan);
	})
	.catch(e => {
		console.error(e);
	});
```

---

# Examples

See the `examples` directory.