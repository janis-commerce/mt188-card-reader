'use strict';

const logger = require('lllog')();
const MT188Driver = require('mt188-driver');

const { MagneticCard: Tracks } = MT188Driver;

class MT188MagneticBandCard {

	async getPAN() {

		const magneticBandContent = await MT188Driver.readMagneticCard(Tracks.Track2);
		logger.debug(`Magnetic band read. Content: ${magneticBandContent}`);

		await MT188Driver.clearMagneticCard();

		return {
			cardNumber: magneticBandContent.substr(0, 16),
			expirationMonth: magneticBandContent.substr(16, 2),
			expirationYear: magneticBandContent.substr(18, 2)
		};
	}

}

module.exports = MT188MagneticBandCard;
