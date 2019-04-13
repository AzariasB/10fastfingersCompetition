import { expect } from 'chai';
import 'mocha';
import * as chrome from 'sinon-chrome';
global['chrome'] = chrome;
import { join } from '../../src/common';

describe('Common methods', () => {
	it('Should join elements togeter', () => {
		const simpleJoin = join('a', 'b');
		expect(simpleJoin).to.equal('a/b');

		const moreJoins = join('x', 'mostElement', '', 'j');
		expect(moreJoins).to.equal('x/mostElement//j');
	});
});
