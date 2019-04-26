import { expect } from 'chai';
import 'mocha';
import * as chrome from 'sinon-chrome';
global['chrome'] = chrome;
import { join, is10fastFingersUrl } from '../../src/common';

describe('Common methods', () => {
	it('Should join elements togeter', () => {
		const simpleJoin = join('a', 'b');
		expect(simpleJoin).to.equal('a/b');

		const moreJoins = join('x', 'mostElement', '', 'j');
		expect(moreJoins).to.equal('x/mostElement//j');
	});

	it('Should be able to detect a valid 10fastfingers url', () => {
		const validUrl = 'https://10fastfingers.com';

		const valids = [ validUrl, validUrl + '/randomStuff', validUrl + '/' ];

		const invalids = [ `a${validUrl}`, `${validUrl}c`, `http://google.fr`, 'http://10fastfingers.com' ];

		valids.forEach((v) => expect(is10fastFingersUrl(v), `Valid url : ${v}`).to.be.true);
		invalids.forEach((iv) => expect(is10fastFingersUrl(iv), `Invalid url ${iv}`).to.be.false);
	});
});
