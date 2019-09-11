'use strict';

const MT188CardReaderError = require('../mt188-card-reader-error');

class MT188UnhandledCard {

	async getPAN() {
		throw new MT188CardReaderError('Unknown card type');
	}

}

module.exports = MT188UnhandledCard;
