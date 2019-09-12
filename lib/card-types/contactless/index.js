'use strict';

const logger = require('lllog')();
const TLV = require('node-tlv');
const MT188Driver = require('card-reader');

const generatePDOL = require('../../pdol-generator');

const APDUS = {
	FCI_1: '00A404000E315041592E5359532E444446303100',
	FCI_2: '00A404000E325041592E5359532E444446303100'
};

class MT188ContactlessCard {

	async getPAN() {

		let cardData;

		const atr = await MT188Driver.RFAPowerOn();
		logger.info(`RFA powered ON. ATR: ${atr}`);

		let error;
		try {

			logger.info('Fetching App Id');
			const appId = await this.getAppId();
			logger.info(`App Id: ${appId}`);

			logger.info(`Selecting App ${appId}`);
			const pdol = await this.selectApp(appId);
			logger.info(`PDOL: ${pdol}`);

			logger.info('Getting processing options');
			const processingOptions = await this.getProcessingOptions(pdol);
			logger.info(`Processing options: ${processingOptions}`);

			logger.info('Getting card data');
			cardData = await this.findPAN(processingOptions);
			logger.info(`Card data: ${JSON.stringify(cardData)}`);

		} catch(e) {
			logger.error(`An error ocurred: ${e.message}`);
			error = e;
		}

		MT188Driver.RFAPowerOff();
		logger.info('RFA powered OFF');

		if(error)
			throw error;

		return cardData;
	}

	async getAppId() {

		let appId = await this.getAppIdUsingApdu(APDUS.FCI_1);
		if(appId)
			return appId;

		appId = await this.getAppIdUsingApdu(APDUS.FCI_2);
		if(appId)
			return appId;
	}

	async getAppIdUsingApdu(record) {
		logger.debug(`Sending APDU: ${record}`);
		const fci = await MT188Driver.RFASendAPDU(record);
		logger.debug(`Response to ${record}: ${fci}`);

		return fci && this.searchAppIdInFCI(fci.substr(2));
	}

	searchAppIdInFCI(fci) {

		logger.info(`Searching App Id in FCI ${fci}`);
		const tlv = TLV.parse(fci);
		const appId = tlv.find('4F');

		return appId && appId.value;
	}

	async selectApp(appId) {

		const apdu = `00A4040007${appId}00`;

		logger.debug(`Sending APDU: ${apdu}`);
		const appData = await MT188Driver.RFASendAPDU(apdu);
		logger.debug(`Response to ${apdu}: ${appData}`);

		const tlv = TLV.parse(appData.substr(2));

		const pdol = tlv.find('9F38');

		return pdol && pdol.value;
	}

	async getProcessingOptions(pdol) {

		const pdolResolved = generatePDOL(pdol);
		const pdolResolvedLength = pdolResolved.length / 2;

		const lengthAsHex = pdolResolvedLength.toString(16);
		const lengthExtendedAsHex = (pdolResolvedLength + 2).toString(16);

		const apdu = `80A80000${lengthExtendedAsHex}83${lengthAsHex}${pdolResolved}00`;

		logger.debug(`Sending APDU: ${apdu}`);
		const processingOptions = await MT188Driver.RFASendAPDU(apdu);
		logger.debug(`Response to ${apdu}: ${processingOptions}`);

		return processingOptions.substr(2);
	}

	findPAN(processingOptions) {

		const tlv = TLV.parse(processingOptions);

		const cardData = tlv.find('57');

		if(!cardData || !cardData.value)
			return;

		const track2 = cardData.value;

		return {
			cardNumber: track2.substr(0, 16),
			expirationMonth: track2.substr(19, 2),
			expirationYear: track2.substr(17, 2)
		};
	}

}

module.exports = MT188ContactlessCard;
