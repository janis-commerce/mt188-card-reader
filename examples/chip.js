'use strict';

const logger = require('lllog')();

const isVerbose = process.argv.filter(a => a === '-v').length;

logger.setMinLevel(isVerbose ? 'debug' : 'error');

const { MT188CardReader } = require('../lib');

const cardReader = new MT188CardReader();

cardReader.getPANWithRetries({ contactless: false })
	.then(pan => {

		// eslint-disable-next-line no-console
		console.log({
			...pan,
			cardNumber: pan.cardNumber.replace(/^([0-9]{6})[0-9]{6}([0-9]{4})/, '$1******$2')
		});
	})
	.catch(e => {
		logger.error(e.message);
	});
