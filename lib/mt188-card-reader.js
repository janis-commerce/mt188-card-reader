'use strict';

const logger = require('lllog')();
const MT188Driver = require('card-reader');

const MT188CardReaderError = require('./mt188-card-reader-error');
const MT188Card = require('./mt188-card');

let device;
let isOpen = false;

const tryToClose = async () => {

	// @todo Fixear la lib que no recibe el device a cerrar
	const isLibFixed = false;

	if(isLibFixed && device && isOpen) {
		try {
			await MT188Driver.close();
			logger.info(`Device ${device} closed`);
			isOpen = false;
		} catch(closeError) {
			logger.error(`An error ocurred closing the device ${device}: ${closeError.message}`);
		}
	}
};

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

			[device] = devices;

			if(!isOpen) {
				await MT188Driver.open(device);
				isOpen = true;
			}

			logger.info(`Device ${device} opened`);

			const cardType = contactless
				? { type: MT188Driver.CardType.ContactlessTypeA }
				: await MT188Driver.getCardType();

			logger.info(`Card type: ${JSON.stringify(cardType)}`);

			const PAN = this.card.getPANFromCardType(cardType);

			await tryToClose();

			return PAN;

		} catch(e) {

			await tryToClose();

			logger.error(`An error ocurred: ${e.message}`);

			if(e.name === 'MT188CardReaderError')
				throw e;

			throw new MT188CardReaderError(e);
		}
	}

}

module.exports = MT188CardReader;
