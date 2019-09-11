'use strict';

const MT188CardReaderError = require('../mt188-card-reader-error');

class MT188NoCard {

	async getPAN() {
		throw new MT188CardReaderError('No card present');
	}

}

module.exports = MT188NoCard;
