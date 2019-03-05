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

export const CONFIG_VERSION = 1;
export const tr = chrome.i18n.getMessage;
export const WEBSITE_URL = 'https://10fastfingers.com';
export const ALARM_NAME = 'typingTestRefresh';

export enum OpenOption {
	OpenTestPage = 'open_test_page',
	OpenCompetitionPage = 'open_competition_page',
	OpenAdvanced = 'open_advanced_page',
	OpenCustom = 'open_custom_page',
	OpenMultiPlayer = 'open_multiplayer_page',
	OpenTextPractice = 'open_text_practice_page',
	OpenTop100 = 'open_top_100_page'
}

export interface Config {
	version: number;
	checkTimeout: number;
	langWatch: string[];
	websiteLanguage: string;
	openOption: OpenOption;
	notifyOnCreationg: boolean;
	animateIcon: boolean;
}

export const PAGES_URL = {
	normalTest: 'typing-test',
	competitions: 'competitions',
	customTest: 'widgets/typingtest',
	multiPlayer: 'multiplayer',
	textPractice: 'text-practice/new',
	top100: 'top1000'
};

export const join = (...args: string[]): string => args.join('/');

export const is10fastFingersUrl = (url: string): boolean => url.indexOf(WEBSITE_URL) === 0;

export const getCompetitionURl = (competitionUrl: string): string => join(WEBSITE_URL, competitionUrl);

export const getTypingTestUrl = (language: string = 'english'): string =>
	join(WEBSITE_URL, PAGES_URL.normalTest, language);

export const getCompetitionsPage = (): string => join(WEBSITE_URL, PAGES_URL.competitions);
