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

enum OpenOption {
	OpenTestPage,
	OpenCompetitionPage,
	OpenAdvanced,
	OpenCustom,
	OpenMultiPlayer,
	OpenTextPractice,
	OpenTop100
}

interface Config {
	version: number;
	checkTimeout: number;
	langWatch: string[];
	openOption: OpenOption;
	notifyOnCreationg: boolean;
}

export class StorageService {
	private config: Config;
	constructor() {
		chrome.storage.sync.get((items) => {
			console.log(items);
			if (!items || !items.version) {
				this.config = {
					version: 1,
					checkTimeout: 5,
					langWatch: [ 'english' ],
					openOption: OpenOption.OpenTestPage,
					notifyOnCreationg: true
				};
				chrome.storage.sync.set(this.config);
			} else {
				this.updateConfig(items);
			}
		});

		chrome.storage.onChanged.addListener((items) => this.updateConfig(items));
	}

	private updateConfig(items: any) {
		Object.keys(this.config).map((k) => {
			if (items[k]) {
				this.config[k] = items[k];
			}
		});
	}

	public get checkTimeout(): number {
		return this.config.checkTimeout;
	}

	public get langWatch(): string[] {
		return this.config.langWatch;
	}

	public get openOption(): OpenOption {
		return this.config.openOption;
	}

	public get notifyOnCreation(): boolean {
		return this.notifyOnCreation;
	}
}
