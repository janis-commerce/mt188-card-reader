'use strict';

const { MT188CardReader } = require('../lib');

const cardReader = new MT188CardReader();

cardReader.getPAN({ contactless: true})
	.then(pan => console.log(pan))
	.catch(e => console.error(e));