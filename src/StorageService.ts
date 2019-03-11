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

import { Config, OpenOption, CONFIG_VERSION } from './common';

export class StorageService {
	private config: Config;

	public async init(): Promise<void> {
		this.config = {
			version: CONFIG_VERSION,
			checkTimeout: 5,
			langWatch: [ 'english' ],
			openOption: OpenOption.OpenTestPage,
			notifyOnCreation: true,
			animateIcon: true,
			websiteLanguage: 'english'
		};
		const items = await this.getConfig();
		if (!items || !items.version) await this.saveConfig(this.config);
		else this.updateConfig(items);
		chrome.storage.onChanged.addListener((items) => this.updateConfig(items));
	}

	private async getConfig(): Promise<Config> {
		return new Promise((res, rej) => {
			chrome.storage.sync.get((items: Config) => res(items));
		});
	}

	private async saveConfig(item: Config): Promise<Config> {
		return new Promise((res, rej) => {
			chrome.storage.sync.set(item, () => res(item));
		});
	}

	private updateConfig(items: any) {
		Object.keys(this.config).map((k) => {
			if (items[k] !== undefined) {
				if (items[k].newValue === undefined) {
					this.config[k] = items[k];
				} else {
					this.config[k] = items[k].newValue;
				}
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
		return this.config.notifyOnCreation;
	}

	public get websiteLanguage(): string {
		return this.config.websiteLanguage;
	}

	public get animateIcon(): boolean {
		return this.config.animateIcon;
	}
}
