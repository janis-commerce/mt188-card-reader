'use strict';

class MT188CardReaderError extends Error {

	static get codes() {

		return {
			// your errors here...
		};

	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'MT188CardReaderError';
	}
}

module.exports = MT188CardReaderError;
