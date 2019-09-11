'use strict';

const logger = require('lllog')();
const MT188Driver = require('mt188-driver');

const APDUS = {
	FCI_1: '00A404000E315041592E5359532E444446303100',
	FCI_2: '00A404000E325041592E5359532E444446303100'
};

class MT188ContactlessCard {

	async getPAN() {

		const atr = await MT188Driver.RFAPowerOn();
		logger.debug(`RFA powered ON. ATR: ${atr}`);

		try {

			const fci = await this.getFci();
			logger.debug(`FCI Fetched: ${fci}`);

		} catch(e) {
			MT188Driver.RFAPowerOff();
			logger.debug('RFA powered OFF');

			throw e;
		}
	}

	async getFci() {

		logger.debug(`Sending APDU: ${APDUS.FCI_1}`);
		const fci1 = await MT188Driver.RFASendAPDU(APDUS.FCI_1);
		logger.debug(`Response to ${APDUS.FCI_1}: ${fci1}`);

		if(fci1)
			return fci1;

		logger.debug(`Sending APDU: ${APDUS.FCI_2}`);
		const fci2 = await MT188Driver.RFASendAPDU(APDUS.FCI_2);
		logger.debug(`Response to ${APDUS.FCI_2}: ${fci2}`);

		return fci2;
	}

}

module.exports = MT188ContactlessCard;
