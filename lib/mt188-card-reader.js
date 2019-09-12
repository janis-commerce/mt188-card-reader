'use strict';

const logger = require('lllog')();
const MT188Driver = require('card-reader');

const MT188CardReaderError = require('./mt188-card-reader-error');
const MT188Card = require('./mt188-card');

class MT188CardReader {

	constructor() {
		this.card = new MT188Card();
	}

	async getPAN({ contactless = false }) {

		try {

			const devices = await MT188Driver.selectDevice();

			if(!devices.length)
				throw new MT188CardReaderError('No card readers found');

			logger.info(`${devices.length} devices found: ${devices.join(', ')}`);

			const [device] = devices;

			await MT188Driver.open(device);

			logger.info(`Device ${device} opened`);

			const cardType = contactless
				? { type: MT188Driver.CardType.ContactlessTypeA }
				: await MT188Driver.getCardType();

			logger.info(`Card type: ${JSON.stringify(cardType)}`);

			const PAN = this.card.getPANFromCardType(cardType);

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
