'use strict';

const assert = require('assert');
const sinon = require('sinon');
const MT188Driver = require('@janiscommerce/mt188-card-reader-windows-driver');

const { MT188CardReader, MT188CardReaderError } = require('../lib');

describe('MT188CardReader', () => {

	describe('Get PAN', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should throw if devices cannot be listed', async () => {

			sinon.stub(MT188Driver, 'selectDevice')
				.throws(Error, 'Some error');

			const cardReader = new MT188CardReader();
			await assert.rejects(() => cardReader.getPAN({}), MT188CardReaderError);
		});

		it('Should throw if no devices are found', async () => {

			sinon.stub(MT188Driver, 'selectDevice')
				.returns([]);

			const cardReader = new MT188CardReader();
			await assert.rejects(() => cardReader.getPAN({}), MT188CardReaderError);
		});

		it('Should throw if device cannot be opened', async () => {

			sinon.stub(MT188Driver, 'selectDevice')
				.returns(['Some Device']);

			sinon.stub(MT188Driver, 'open')
				.throws(Error, 'Some error');

			const cardReader = new MT188CardReader();
			await assert.rejects(() => cardReader.getPAN({}), MT188CardReaderError);
		});

		it('Should throw if card type cannot be fetched', async () => {

			const atr = '8801015f2d0865737074656e66729f1101019000';

			sinon.stub(MT188Driver, 'selectDevice')
				.returns(['Some Device']);

			sinon.stub(MT188Driver, 'open')
				.returns(atr);

			sinon.stub(MT188Driver, 'getCardType')
				.throws(Error, 'Some error');

			const cardReader = new MT188CardReader();
			await assert.rejects(() => cardReader.getPAN({}), MT188CardReaderError);
		});

		it('Should throw if no card is present', async () => {

			const atr = '8801015f2d0865737074656e66729f1101019000';
			const cardType = MT188Driver.CardType.NoCardInside;

			sinon.stub(MT188Driver, 'selectDevice')
				.returns(['Some Device']);

			sinon.stub(MT188Driver, 'open')
				.returns(atr);

			sinon.stub(MT188Driver, 'getCardType')
				.returns(cardType);

			const cardReader = new MT188CardReader();
			await assert.rejects(() => cardReader.getPAN({}), {
				name: 'MT188CardReaderError',
				message: 'No card present'
			});
		});
	});
});
