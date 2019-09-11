# mt188-card-reader

MT188 Card Reader

## Installation
```sh
npm install @janiscommerce/mt188-card-reader
```

## API
### async getPAN()
Gets the card's PAN (card number and expiration date). It handles magnetic card, chip card and contactless
**Returns** Object with `cardNumber`, `expirationMonth` and `expirationYear` properties.
**Throws** a MT188CardReaderError in case of error

## Usage
```js
const MT188CardReader = require('@janiscommerce/mt188-card-reader');

```

## Examples
