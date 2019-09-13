'use strict';

const MT188Driver = require('card-reader');

const MT188SmartCard = require('./smartcard');

class MT188ContactlessCard extends MT188SmartCard {

	powerOn() {
		return MT188Driver.RFAPowerOn();
	}

	sendAPDU(apdu) {
		return MT188Driver.RFASendAPDU(apdu);
	}

	powerOff() {
		return MT188Driver.RFAPowerOff();
	}
}

module.exports = MT188ContactlessCard;
