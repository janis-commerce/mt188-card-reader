'use strict';

const TLV = require('node-tlv');

const generateByTag = (tag, valueLength) => {

	const date = new Date();

	const year = date.getFullYear().toString()
		.substr(-2);

	const month = (date.getMonth() + 1).toString().padStart(2, '0');

	const day = date.getDate().toString()
		.padStart(2, '0');

	switch(tag) {

		case '9F66': // https://www.emvco.com/wp-content/uploads/2017/05/C-6_Kernel_6_v2.6_20160512101849195.pdf Section "D.11"
			return 'B620C000';

		case '9F02': // Transaction money amount
			return '000000000001';

		case '9F03': // Cashback money amount
			return '000000000000';

		case '9F1A': // Country code of the terminal
		case '5F2A': // Country code of the currency
			return '0032'; // ARG

		case '9A': // Transaction Date	(YYMMDD)
			return `${year}${month}${day}`;

		case '9C': // Transaction Type. See https://en.wikipedia.org/wiki/ISO_8583#Processing_code
			return '00'; // Authorization

		case '9F37': // Unpredictable Number
			// Generation from https://gist.github.com/6174/6062387#gistcomment-2651745
			return [...Array(8)].map(() => (~~(Math.random() * 16)).toString(16)).join('');

		case '95': // Terminal Verification Results (TVR) - @todo Recheck
		default: // Unknown tags. Just fill with zero's
			return '0'.repeat(valueLength * 2);
	}
};

module.exports = function generatePDOL(pdol) {

	let generatedPdol = '';

	while(pdol.length) {

		const tlv = TLV.parse(pdol);

		const valueLength = parseInt(pdol.substr(tlv.tag.length, 2), 16);
		const valueLengthAsHex = valueLength.toString(16).length === 1 ? `0${valueLength.toString(16)}` : valueLength.toString(16);

		// Remove the processed part and continue with the rest
		pdol = pdol.substr(tlv.tag.length + valueLengthAsHex.length);

		generatedPdol = `${generatedPdol}${generateByTag(tlv.tag, valueLength)}`;
	}

	return generatedPdol;
};
