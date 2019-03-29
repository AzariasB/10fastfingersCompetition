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
export const join = (...args: string[]): string => args.join('/');
export const CONFIG_VERSION = 1;
export const tr = chrome.i18n.getMessage;
export const WEBSITE_URL = 'https://10fastfingers.com';
export const CREATE_COMPETITION_URL = join(WEBSITE_URL, 'competitions', 'add');
export const ALARM_NAME = 'typingTestRefresh';
export const CONNECTED_ICON = 'pictures/icon.png';
export const DISCONNECTED_ICON = 'pictures/icon_gray.png';
export const BIG_ICON = 'pictures/big_icon.png';
export const ANIMATION_SPEED = 20;
export const NOTIFICATION_TIME = 2000;

export enum OpenOption {
	OpenTestPage = 'open_test_page',
	OpenCompetitionPage = 'open_competition_page',
	OpenAdvanced = 'open_advanced_page',
	OpenCustom = 'open_custom_page',
	OpenMultiPlayer = 'open_multiplayer_page',
	OpenTextPractice = 'open_text_practice_page',
	OpenTop1000 = 'open_top_1000_page'
}

export interface Config {
	version: number;
	checkTimeout: number;
	langWatch: string[];
	websiteLanguage: string;
	openOption: OpenOption;
	notifyOnCreation: boolean;
	animateIcon: boolean;
	createIfPossible: boolean;
}

const PAGES_URL = {
	[OpenOption.OpenTestPage]: 'typing-test',
	[OpenOption.OpenAdvanced]: 'advanced-typing-test',
	[OpenOption.OpenCompetitionPage]: 'competitions',
	[OpenOption.OpenCustom]: 'widgets/typingtest',
	[OpenOption.OpenMultiPlayer]: 'multiplayer',
	[OpenOption.OpenTextPractice]: 'text-practice/new',
	[OpenOption.OpenTop1000]: 'top1000'
};

export const is10fastFingersUrl = (url: string): boolean => url.indexOf(WEBSITE_URL) === 0;

export const getCompetitionURl = (competitionUrl: string): string => join(WEBSITE_URL, competitionUrl);

export const getTypingTestUrl = (language: string = 'english'): string =>
	join(WEBSITE_URL, PAGES_URL[OpenOption.OpenTestPage], language);

export const getCompetitionsPage = (): string => join(WEBSITE_URL, PAGES_URL[OpenOption.OpenCompetitionPage]);

export const getAlternatePage = (opOp: OpenOption, lang: string) => {
	switch (opOp) {
		case OpenOption.OpenAdvanced:
		case OpenOption.OpenTestPage:
			return join(PAGES_URL[opOp], lang);
		default:
			return PAGES_URL[opOp];
	}
};
