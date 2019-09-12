'use strict';

const logger = require('lllog')();
const MT188Driver = require('card-reader');

const { CardType } = MT188Driver;

const NoCard = require('./card-types/no-card');
const ChipCard = require('./card-types/chip');
const ContactlessCard = require('./card-types/contactless');
const MagneticBandCard = require('./card-types/magnetic-band');
const UnhandledCard = require('./card-types/unhandled');

const cardTypesHandlers = {
	[CardType.NoCardInside]: NoCard,
	[CardType.ContactIC]: ChipCard,
	[CardType.ContactlessTypeA]: ContactlessCard,
	[CardType.ContactlessTypeB]: UnhandledCard,
	[CardType.ContactlessTypeM1]: UnhandledCard,
	[CardType.Unidentified]: UnhandledCard
};

class MT188Card {

	getHandler({ type }) {
		const HandlerClass = (type && cardTypesHandlers[type]) || MagneticBandCard;

		return new HandlerClass();
	}

	getPANFromCardType(cardType) {

		const handler = this.getHandler(cardType);

		logger.info(`Handling card with ${handler.constructor.name}`);

		return handler.getPAN();
	}

}

module.exports = MT188Card;
