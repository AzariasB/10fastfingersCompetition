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

import { IconAnimator } from './IconAnimator';
import { PageParseService } from './PageParserService';
import {
	getCompetitionsPage,
	getCompetitionURl,
	getAlternatePage,
	join,
	tr,
	NOTIFICATION_TIME,
	WEBSITE_URL,
	BIG_ICON
} from './common';
import { Alarm } from './Alarm';
import { StorageService } from './StorageService';

/**
 * Main class of the extension, used to coordinate
 * all the elements : the alarm, the storage and the icon
 */
class App {
	private iconAnimator: IconAnimator;
	private alarm: Alarm;
	private readonly storage: StorageService;

	constructor() {
		this.storage = new StorageService();
		this.storage.init().then(() => {
			this.iconAnimator = new IconAnimator(
				<HTMLImageElement>document.getElementById('logged_in'),
				<HTMLCanvasElement>document.getElementById('canvas')
			);
			this.alarm = new Alarm(() => this.storage.checkTimeout, () => this.updateBadge());
			this.updateBadge();
			chrome.browserAction.onClicked.addListener(() => this.goToCompetition());
			chrome.storage.onChanged.addListener(() => this.updateBadge());
			chrome.notifications.onClicked.addListener(() => this.goToCompetition());
		});
	}

	/**
	 * uses the page parser to get the available competitions, and update
	 * the extension badge, notify the user if a new competition was created
	 */
	private async updateBadge(): Promise<string[]> {
		try {
			const compets = await PageParseService.parse(getCompetitionsPage(), this.storage.langWatch);
			const shownCompetitions = await PageParseService.getDisplayedCompetitions();
			this.iconAnimator.showConnected(compets.length);
			if (shownCompetitions < compets.length) {
				this.notifyCompetCreation();
			}
			return compets;
		} catch (err) {
			console.error(err);
			this.iconAnimator.showDisconnected();
			return [];
		}
	}

	/**
	 * creates a notification
	 * only if the option is on
	 */
	private notifyCompetCreation() {
		if (!this.storage.notifyOnCreation) return;
		chrome.notifications.create({
			type: 'basic',
			iconUrl: BIG_ICON,
			eventTime: NOTIFICATION_TIME,
			title: '10fastfingers competition',
			message: tr('one_was_created'),
			isClickable: true
		});
	}

	/**
	 * When the extension icon is clicked it competitions are available
	 * goes to the oldest
	 * Otherwise, go to the alternative page, chosen by the user
	 */
	private goToCompetition() {
		if (this.storage.animateIcon) this.iconAnimator.beginAnimation();
		this.updateBadge()
			.then((compets) => {
				if (compets.length === 0) {
					this.goToAlternativePage();
				} else {
					this.openCompetitionTab(compets.shift());
				}
				this.iconAnimator.endAnimation();
			})
			.catch(() => {
				this.iconAnimator.endAnimation();
			});
	}

	private openCompetitionTab(competition: string) {
		chrome.tabs.create({
			active: true,
			url: getCompetitionURl(competition)
		});
	}

	private goToAlternativePage() {
		chrome.tabs.query(
			{
				url: join(WEBSITE_URL, '*')
			},
			(tabs) => this.openFirstTab(tabs)
		);
	}

	private openFirstTab(tabs: chrome.tabs.Tab[]) {
		const url = join(WEBSITE_URL, getAlternatePage(this.storage.openOption, this.storage.websiteLanguage));
		if (tabs.length === 0) {
			chrome.tabs.create({ url });
		} else {
			chrome.tabs.update(tabs[0].id, {
				active: true,
				url
			});
		}
	}
}

const app = new App();
