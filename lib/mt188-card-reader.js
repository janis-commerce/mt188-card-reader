'use strict';

const MT188Driver = require('mt188-driver');

const MT188CardReaderError = require('./mt188-card-reader-error');

class MT188CardReader {

	async getPAN() {
		try {

			const devices = await MT188Driver.selectDevice();

			if(!devices.length)
				throw new MT188CardReaderError('No card readers found');

			// const [device] = devices;

			// await MT188Driver.open(device);
		} catch(e) {

			if(e.name === 'MT188CardReaderError')
				throw e;

			throw new MT188CardReaderError(e);
		}
	}

}

module.exports = MT188CardReader;
