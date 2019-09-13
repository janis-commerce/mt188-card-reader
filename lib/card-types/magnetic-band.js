'use strict';

const logger = require('lllog')();
const MT188Driver = require('card-reader');

const { MagneticCardType: MagneticCardStatus, MagneticCard: Tracks } = MT188Driver;

class MT188MagneticBandCard {

	constructor(magneticStatus) {
		this.status = magneticStatus;
	}

	async getPAN() {

		if(this.status === parseInt(MagneticCardStatus.NoReadableMagneticCardInfo, 16))
			return;

		const magneticBandContent = await MT188Driver.readMagneticCard(Tracks.Track2);
		logger.info(`Magnetic band read. Content: ${magneticBandContent}`);

		if(magneticBandContent.indexOf('=') === -1)
			return;

		const [cardNumber, rest] = magneticBandContent.split('=');

		if(!cardNumber.match(/^[0-9]{15,16}$/) || !rest.match(/[0-9]{4,}/))
			return;

		await MT188Driver.clearMagneticCard();

		return {
			cardNumber,
			expirationMonth: rest.substr(2, 2),
			expirationYear: rest.substr(0, 2)
		};
	}

}

module.exports = MT188MagneticBandCard;
