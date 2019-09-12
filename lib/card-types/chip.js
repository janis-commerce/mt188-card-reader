'use strict';

const logger = require('lllog')();
const MT188Driver = require('card-reader');

const CHIP_SIM_NUMBER = 0;

const APDUS = {
	FCI_1: '00A404000E315041592E5359532E444446303100',
	FCI_2: '00A404000E325041592E5359532E444446303100'
};

class MT188ChipCard {

	async getPAN() {

		const atr = await MT188Driver.SIMPowerOn(CHIP_SIM_NUMBER);
		logger.info(`SIM Slot powered ON. ATR: ${atr}`);

		try {

			const fci = await this.getFci();
			logger.info(`FCI Fetched: ${fci}`);

		} catch(e) {
			MT188Driver.SIMPowerOff(CHIP_SIM_NUMBER);
			logger.info('SIM Slot powered OFF');

			throw e;
		}
	}

	async getFci() {

		logger.info(`Sending APDU: ${APDUS.FCI_1}`);
		const fci1 = await MT188Driver.SIMSendAPDU(CHIP_SIM_NUMBER, APDUS.FCI_1);
		logger.info(`Response to ${APDUS.FCI_1}: ${fci1}`);

		if(fci1)
			return fci1;

		logger.info(`Sending APDU: ${APDUS.FCI_2}`);
		const fci2 = await MT188Driver.SIMSendAPDU(CHIP_SIM_NUMBER, APDUS.FCI_2);
		logger.info(`Response to ${APDUS.FCI_2}: ${fci2}`);

		return fci2;
	}

}

module.exports = MT188ChipCard;