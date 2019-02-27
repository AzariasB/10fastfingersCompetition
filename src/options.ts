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

import { tr } from './common';
import { availableLang } from './languages';

// Saves options to chrome.storage

var noCompet = [ tr('goto_test'), tr('goto_competition') ];

function initDoc() {
	var idToSet = {
		main_title: 'main_title',
		option1_text: 'lang_option',
		option2_text: 'refresh_option',
		option3_text: 'noCompet_option',
		animation_text: 'animation_option',
		notification_text: 'notification_option',
		save: 'confirm_save'
	};

	for (var i in idToSet) {
		document.getElementById(i).innerHTML = tr(idToSet[i]);
	}
}

function setOptions() {
	for (let i in availableLang) {
		var opt = document.createElement('OPTION');
		opt.setAttribute('value', i);
		opt.appendChild(document.createTextNode(availableLang[i]));
		document.getElementById('language').appendChild(opt);
	}

	for (let i = 0; i < noCompet.length; i++) {
		var opt = document.createElement('INPUT');
		opt.setAttribute('id', i + '');
		opt.setAttribute('type', 'radio');
		opt.setAttribute('name', 'groupCompet');
		opt.setAttribute('value', noCompet[i]);
		var lab = document.createElement('LABEL');
		lab.setAttribute('for', i + '');
		lab.appendChild(document.createTextNode(noCompet[i]));
		var formGroup = document.createElement('DIV');
		formGroup.setAttribute('class', 'form-group');
		formGroup.appendChild(opt);
		formGroup.appendChild(lab);
		document.getElementById('option3').appendChild(formGroup);
	}
}

function save_options() {
	var el = <HTMLSelectElement>document.getElementById('language'),
		noComp = document.querySelector('input[name="groupCompet"]:checked'),
		languageVal = el.value,
		languageName = el.options[el.selectedIndex].text,
		refreshing = parseInt(document.getElementById('refreshing').value),
		noCompetition = noComp.id,
		loadingAnim = document.getElementById('animation').checked,
		notif = document.getElementById('notification').checked;

	chrome.storage.sync.set(
		{
			favLangVal: languageVal,
			favLangName: languageName,
			refreshTimeout: refreshing,
			noCompetition: noCompetition,
			loadingAnimation: loadingAnim,
			notification: notif
		},
		function() {
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = tr('option_saved');
			setTimeout(function() {
				status.textContent = '';
			}, 2000);
		}
	);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get(
		{
			favLangVal: 'english',
			favLangName: 'English',
			refreshTimeout: 10,
			noCompetition: 0,
			loadingAnimation: true,
			notification: true
		},
		function(items) {
			document.getElementById('language').value = items.favLangVal;
			document.getElementById('refreshing').value = items.refreshTimeout;
			var noCompetOptions = document.getElementsByName('groupCompet');
			var indexChecked = items.noCompetition;
			for (var i = 0; i < noCompetOptions.length; i++) {
				noCompetOptions[i].checked = indexChecked | (0 === i);
			}
			document.getElementById('animation').checked = items.loadingAnimation;
			document.getElementById('notification').checked = items.notification;
		}
	);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

initDoc();
setOptions();
