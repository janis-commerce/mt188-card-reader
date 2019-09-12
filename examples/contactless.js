'use strict';

const logger = require('lllog')();

const { MT188CardReader } = require('../lib');

const cardReader = new MT188CardReader();

cardReader.getPAN({ contactless: true})
	.then(pan => {

		logger.info();

		if(pan) {
			logger.info('Card data found!');
			logger.info(pan)
		} else {
			logger.info('Could not get card data.');
		}
	})
	.catch(e => console.error(e));