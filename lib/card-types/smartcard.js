'use strict';

const logger = require('lllog')();
const TLV = require('node-tlv');

const generatePDOL = require('../pdol-generator');

const APDUS = {
	FCI_1: '00A404000E315041592E5359532E444446303100',
	FCI_2: '00A404000E325041592E5359532E444446303100'
};

class MT188SmartCard {

	powerOn() {
		throw new Error('Should override powerOn method for smart cards.');
	}

	sendAPDU(apdu) {
		throw new Error(`Should override sendAPDU method for smart cards. APDU ${apdu} could not be sent`);
	}

	powerOff() {
		throw new Error('Should override powerOff method for smart cards.');
	}

	async getPAN() {

		let cardData;

		const atr = await this.powerOn();
		logger.info(`Device powered ON. ATR: ${atr}`);

		let error;
		try {

			logger.info('Fetching App Id');
			const appId = await this.getAppId();
			logger.info(`App Id: ${appId}`);

			if(!appId)
				throw new Error('Could not get APP Id');

			logger.info(`Selecting App ${appId}`);
			const pdol = await this.selectApp(appId);
			logger.info(`PDOL: ${pdol}`);

			logger.info('Getting processing options');
			const processingOptions = await this.getProcessingOptions(pdol);
			logger.info(`Processing options: ${processingOptions}`);

			if(!processingOptions)
				throw new Error('Could not get Processing options');

			logger.info('Getting card data');
			cardData = this.findPAN(processingOptions);
			logger.info(`Card data: ${cardData}`);

		} catch(e) {
			logger.error(`An error ocurred: ${e.stack}`);
			error = e;
		}

		this.powerOff();
		logger.info('Device powered OFF');

		if(error)
			throw error;

		return cardData;
	}

	async getAppId() {

		let appId = await this.getAppIdUsingApdu(APDUS.FCI_1);
		if(appId)
			return appId;
		logger.debug('App Id not found in first FCI');

		appId = await this.getAppIdUsingApdu(APDUS.FCI_2);
		if(appId)
			return appId;
		logger.debug('App Id not found in second FCI');

		// AMEX
		const afl = '08010200';

		const aflContents = await this.readAppFile(afl);

		for(const aflContent of aflContents) {

			const tlv = TLV.parse(aflContent);
			const appIdTag = tlv.find('4F');

			if(appIdTag && appIdTag.value)
				return appIdTag.value;
		}
		logger.debug('App Id not found in AFLs');

		// Master
		logger.debug('Mastercard hardcoded App Id returned');
		return 'A0000000041010';
	}

	async getAppIdUsingApdu(record) {
		logger.debug(`Sending APDU: ${record}`);
		const fci = await this.sendAPDU(record);
		logger.debug(`Response to ${record}: ${fci}`);

		return fci && this.searchAppIdInFCI(fci.replace(/^02/, ''));
	}

	searchAppIdInFCI(fci) {

		logger.info(`Searching App Id in FCI ${fci}`);
		const tlv = TLV.parse(fci);
		const appId = tlv.find('4F');

		return appId && appId.value;
	}

	async selectApp(appId) {

		const appIdLength = appId.length / 2;
		const appIdLengthAsHex = appIdLength.toString(16).padStart(2, '0');

		const apdu = `00A40400${appIdLengthAsHex}${appId}00`;

		logger.info(`Sending APDU: ${apdu}`);
		const appData = await this.sendAPDU(apdu);
		logger.debug(`Response to ${apdu}: ${appData}`);

		const tlv = TLV.parse(appData.replace(/^02/, ''));

		const pdol = tlv.find('9F38');

		return pdol && pdol.value;
	}

	async getProcessingOptions(pdol) {

		let apdu;

		if(pdol) {
			const pdolResolved = generatePDOL(pdol);
			const pdolResolvedLength = pdolResolved.length / 2;

			const lengthAsHex = pdolResolvedLength.toString(16).padStart(2, '0');
			const lengthExtendedAsHex = (pdolResolvedLength + 2).toString(16).padStart(2, '0');

			apdu = `80A80000${lengthExtendedAsHex}83${lengthAsHex}${pdolResolved}00`;
		} else
			apdu = '80A80000028300';

		logger.debug(`Sending APDU: ${apdu}`);
		const processingOptions = await this.sendAPDU(apdu);
		logger.debug(`Response to ${apdu}: ${processingOptions}`);

		return processingOptions.replace(/^02/, '');
	}

	findPAN(processingOptions) {

		const tlv = TLV.parse(processingOptions);

		logger.debug(`Finding pan with tag ${tlv.tag}`);

		if(tlv.tag && tlv.tag === '77')
			return this.findPANFromTag77(tlv);

		logger.debug('Tag 77 processing options not found');

		if(tlv.tag && tlv.tag === '80')
			return this.findPANFromTag80(tlv);

		logger.debug('Tag 80 processing options not found');
	}

	findPANFromTag77(tlv) {

		const tag57 = tlv.find('57');
		if(tag57 && tag57.value)
			return this.parsePanFrom57Tag(tag57.value);

		const tag94 = tlv.find('94');
		if(tag94 && tag94.value)
			return this.findPanFromTag94(tag94);
	}

	async findPanFromTag94({ value }) {
		const afls = value.match(/(.{8})/g);

		if(!afls)
			return Promise.resolve();

		return this.findPANInAFLs(afls);
	}

	findPANFromTag80({ value }) {

		const aip = value.substr(0, 4);
		const afls = value.substr(4).match(/(.{8})/g);

		if(!aip || !afls)
			return Promise.resolve();

		return this.findPANInAFLs(afls);
	}

	async findPANInAFLs(afls) {

		const aflContents = await Promise.all(afls.map(afl => this.readAppFile(afl)));

		for(const aflRecords of aflContents) {
			for(const aflRecord of aflRecords) {

				const tlv = TLV.parse(aflRecord);

				const tag57 = tlv.find('57');
				if(tag57 && tag57.value) {
					const PAN = this.parsePanFrom57Tag(tag57.value);
					if(PAN)
						return PAN;
				}

				const tag5A = tlv.find('5A');
				const tag5F24 = tlv.find('5F24');
				if(tag5A && tag5A.value && tag5F24 && tag5F24.value) {
					const PAN = this.parsePanFrom5AAnd5F24TagS(tag5A.value, tag5F24.value);
					if(PAN)
						return PAN;
				}
			}
		}
	}

	parsePanFrom57Tag(track2) {
		return {
			cardNumber: track2.substr(0, 16),
			expirationMonth: track2.substr(19, 2),
			expirationYear: track2.substr(17, 2)
		};
	}

	parsePanFrom5AAnd5F24TagS(cardNumber, fullExpirationDate) {
		return {
			cardNumber,
			expirationMonth: fullExpirationDate.substr(2, 2),
			expirationYear: fullExpirationDate.substr(0, 2)
		};
	}

	async readAppFile(afl) {

		// See https://www.openscdp.org/scripts/tutorial/emv/readapplicationdata.html

		const shortFileIdentifier = parseInt(afl.substr(0, 2), 16) >> 3;
		const firstRecord = parseInt(afl.substr(2, 2), 16);
		const lastRecord = parseInt(afl.substr(4, 2), 16);
		// const dataAuthenticatedRecordsCount = parseInt(afl.substr(6, 2), 16);

		const filePromises = [];

		for(let currentRecord = firstRecord; currentRecord <= lastRecord; currentRecord++) {

			const apdu = `00B2${currentRecord.toString(16).padStart(2, '0')}${((shortFileIdentifier << 3) | 4).toString(16).padStart(2, '0')}00`;

			logger.debug(`Sending APDU: ${apdu}`);
			filePromises.push({
				apdu,
				promise: this.sendAPDU(apdu)
			});
		}

		const fileContent = await Promise.all(filePromises.map(({ apdu, promise }) => {

			return new Promise(async resolve => {

				try {
					const recordContent = await promise;
					logger.debug(`Response to ${apdu}: ${recordContent}`);

					resolve(recordContent);
				} catch(e) {
					logger.debug(`APDU ${apdu} failed: ${e.message}`);
					resolve();
				}
			});
		}));

		return fileContent.filter(Boolean);
	}

}

module.exports = MT188SmartCard;
