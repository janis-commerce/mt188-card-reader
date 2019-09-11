'use strict';

const logger = require('lllog')();
const MT188Driver = require('mt188-card-reader-windows-driver');

const MT188CardReaderError = require('./mt188-card-reader-error');
const MT188Card = require('./mt188-card');

class MT188CardReader {

	async getPAN() {

		try {

			const devices = await MT188Driver.selectDevice();

			if(!devices.length)
				throw new MT188CardReaderError('No card readers found');

			logger.debug(`${devices.length} devices found: ${devices.join(', ')}`);

			const [device] = devices;

			await MT188Driver.open(device);

			logger.debug(`Device ${device} opened`);

			const cardType = MT188Driver.getCardType();

			logger.debug(`Card type: ${cardType}`);

			const PAN = MT188Card.getPANFromCardType(cardType);

			return PAN;

		} catch(e) {

			logger.error(`An error ocurred: ${e.message}`);

			if(e.name === 'MT188CardReaderError')
				throw e;

			throw new MT188CardReaderError(e);
		}
	}

}

module.exports = MT188CardReader;
