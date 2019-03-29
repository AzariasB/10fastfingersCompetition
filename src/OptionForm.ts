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

import { AutoInit } from 'materialize-css';
import { Config, tr, OpenOption, CONFIG_VERSION } from './common';
import { availableLang } from './languages';

export class OptionForm {
	private saveCallback: (c: Config) => Promise<Config>;

	constructor(options: Config, saveFunc: (c: Config) => Promise<Config>) {
		this.saveCallback = saveFunc;
		this.setValues(options);
		this.translatePage();
		M.AutoInit();
		const saveButton = <HTMLButtonElement>document.getElementById('save');
		saveButton.addEventListener('click', () => this.saveConfig());
	}

	public saveConfig() {
		const selected = document.querySelectorAll('#competitionLanguage option:checked');
		const langWatch = Array.from(selected).map((el) => (<HTMLOptionElement>el).value);
		const websiteLang = (document.querySelector('#websiteLanguage option:checked') as HTMLOptionElement).value;
		const timeoutInput = document.querySelector('input#timeoutRefresh') as HTMLInputElement;
		const timeout = Math.max(1, Math.min(60, +timeoutInput.value));
		timeoutInput.value = timeout + '';
		const noCompet = (document.querySelector('input[name="group1"]:checked') as HTMLInputElement).value;
		const animation = (document.getElementById('animation') as HTMLInputElement).checked;
		const notification = (document.getElementById('notification') as HTMLInputElement).checked;
		const createIfPossible = (document.getElementById('create_compet') as HTMLInputElement).checked;
		const config: Config = {
			animateIcon: animation,
			notifyOnCreation: notification,
			websiteLanguage: websiteLang,
			version: CONFIG_VERSION,
			openOption: <OpenOption>noCompet,
			checkTimeout: timeout,
			langWatch: langWatch,
			createIfPossible: createIfPossible
		};

		this.saveCallback(config).then(() => {
			M.toast({
				html: tr('option_saved')
			});
		});
	}

	private translatePage() {
		document.querySelectorAll('.translatable').forEach((el) => {
			const htmlEl = <HTMLElement>el;
			if (htmlEl.innerText && htmlEl.innerText.length) {
				htmlEl.innerText = tr(htmlEl.innerText) || htmlEl.innerText;
			}
		});
	}

	private setValues(config: Config) {
		//Add available languages
		this.createLanguageSelect(config.langWatch, config.websiteLanguage);
		this.createNoCompetOptions(config.openOption);
		const refreshInput = <HTMLInputElement>document.getElementById('timeoutRefresh');
		refreshInput.value = '' + config.checkTimeout;
		this.check('animation', config.animateIcon);
		this.check('notification', config.notifyOnCreation);
		this.check('create_compet', config.createIfPossible);
	}

	private check(id: string, val: boolean) {
		const input = <HTMLInputElement>document.getElementById(id);
		if (input) input.checked = val;
	}

	private createNoCompetOptions(chosenOption: OpenOption) {
		const parent = document.createElement('p');
		const label = document.createElement('label');
		const input = document.createElement('input');
		input.name = 'group1';
		input.type = 'radio';
		const span = document.createElement('span');
		label.appendChild(input);
		label.appendChild(span);
		parent.appendChild(label);
		const radioGroup = document.getElementById('openOptionGroup');
		Object.keys(OpenOption).map((k) => {
			const val = OpenOption[k];
			const element = <HTMLParagraphElement>parent.cloneNode(true);
			element.querySelector('span').innerText = tr(val) || val;
			const input = element.querySelector('input');
			input.checked = val == chosenOption;
			input.value = val;
			radioGroup.appendChild(element);
		});
	}

	private createLanguageSelect(langWatch: string[], websiteLanguage: string) {
		const competLanguageSelect = document.getElementById('competitionLanguage');
		const websiteLanguageSelect = document.getElementById('websiteLanguage');
		Object.keys(availableLang)
			.sort((a, b) => availableLang[a].value.localeCompare(availableLang[b].value))
			.map((k) => {
				const language = availableLang[k];
				const flagId = language.flagId;
				console.log(flagId);
				const value = language.value;
				const option = document.createElement('option');
				const flag = document.createElement('span');
				flag.classList.add('flag', 'flagid' + flagId);
				option.value = k;
				option.innerText = value;
				option.prepend(flag);
				option.selected = langWatch.indexOf(k) > -1;
				competLanguageSelect.appendChild(option);
				const langClone = <HTMLOptionElement>option.cloneNode(true);
				langClone.selected = websiteLanguage == k;
				websiteLanguageSelect.appendChild(langClone);
			});
	}
}
