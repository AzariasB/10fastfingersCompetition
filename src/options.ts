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

/*
Messages to translate:
choose_languages : choose several languages from the list
choose_language : choose a single language from the list
competition_language : languages to watch for
website_language : Language of the webiste when accessed
open_test_page : Open the default test page
open_advanced : Open the advanced test apge
open_custom : Open the custom test page
open_multiplayer : Open the multiplayer game page
open_text_practice : Open the text practice page
open_top_100 : Open the top 100 page
confirm_save : save button
refresh_option: Refresh timeout
noCompet_option: What to do when there is not competition
animation_option: Animate the icon ?
notification_option: Notify when new is created ?
*/

import { availableLang } from './languages';
import { tr, Config } from './common';
import { OptionForm } from './OptionForm';

class App {
	private optForm: OptionForm;

	constructor() {
		chrome.storage.sync.get((items: Config) => {
			this.optForm = new OptionForm(items, this.saveConfig);
		});
	}

	private async saveConfig(conf: Config): Promise<Config> {
		return new Promise<Config>((res) => {
			chrome.storage.sync.set(conf, () => {
				res(conf);
			});
		});
	}
}

const app = new App();
