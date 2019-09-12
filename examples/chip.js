'use strict';

const logger = require('lllog')();

const isVerbose = process.argv.filter(a => a === '-v').length;

logger.setMinLevel(isVerbose ? 'debug' : 'error');

const { MT188CardReader } = require('../lib');

const cardReader = new MT188CardReader();

const MAX_ATTEMPTS = 20;
let attempts = 0;

const intervalId = setInterval(() => {

	attempts++;

	cardReader.getPAN({ contactless: false })
		.then(pan => {

			logger.info();

			if(pan) {
				logger.info('Card data found!');
				// eslint-disable-next-line no-console
				console.log({
					...pan,
					cardNumber: pan.cardNumber.replace(/^([0-9]{6})[0-9]{6}([0-9]{4})/, '$1******$2')
				});
				clearInterval(intervalId);
			} else {
				if(attempts >= MAX_ATTEMPTS)
					clearInterval(intervalId);

				logger.error('Could not get card data.');
			}
		})
		.catch(e => {
			logger.error(e.message);

			if(attempts >= MAX_ATTEMPTS)
				clearInterval(intervalId);
		});
}, 1000);
