/*
 * The MIT License
 *
 * Copyright 2019 Azarias Boutin.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { expect } from 'chai';
import 'mocha';
import * as chrome from 'sinon-chrome';
import * as jsdom from 'jsdom';
global['document'] = new jsdom.JSDOM('').window.document;
global['chrome'] = chrome;
import { PageParseService } from '../../src/PageParserService';
import { Requester } from '../../src/Requester';
import { readFile } from 'fs';

let fileContent = '';
let requesterGetCalled = false;

Requester.get = async function(url: String): Promise<string> {
	requesterGetCalled = true;
	return fileContent;
};

async function readFileData(): Promise<string> {
	return new Promise((res, rej) => {
		readFile(__dirname + '/fakeData.ts', (err, data) => {
			if (err) return rej(err);
			return res(data.toString('UTF-8'));
		});
	});
}

before(async () => {
	fileContent = await readFileData();
});

describe('Page parser service', () => {
	it('should call the get request method', () => {
		PageParseService.parse('whatever', [ 'french' ]);
		expect(requesterGetCalled).to.be.true;
	});

	it('Should find 5 french competition in the fake data provided', async () => {
		const competitions = await PageParseService.parse('whatever', [ 'french' ]);

		expect(competitions).to.have.length(3);
		expect(competitions).to.deep.equal([
			'/competition/5ccb66888b6e3',
			'/competition/5ccba7500997b',
			'/competition/5ccbbd4a76625'
		]);
	});
});
