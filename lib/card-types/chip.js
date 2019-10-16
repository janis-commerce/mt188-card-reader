'use strict';

const MT188Driver = require('@janiscommerce/mt188-card-reader-windows-driver');

const MT188SmartCard = require('./smartcard');

const CHIP_SIM_NUMBER = 0;

class MT188ChipCard extends MT188SmartCard {

	powerOn() {
		return MT188Driver.SIMPowerOn(CHIP_SIM_NUMBER);
	}

	sendAPDU(apdu) {
		return MT188Driver.SIMSendAPDU(CHIP_SIM_NUMBER, apdu);
	}

	powerOff() {
		return MT188Driver.SIMPowerOff(CHIP_SIM_NUMBER);
	}
}

module.exports = MT188ChipCard;
