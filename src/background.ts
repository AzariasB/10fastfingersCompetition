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
import { getCompetitionsPage, WEBSITE_URL, getTypingTestUrl, getCompetitionURl, join } from './common';
import { Alarm } from './Alarm';
import { StorageService } from './StorageService';

class App {
	private iconAnimator: IconAnimator;
	private alarm: Alarm;
	private storage: StorageService;

	constructor() {
		this.iconAnimator = new IconAnimator();
		this.alarm = new Alarm(() => this.storage.checkTimeout, () => this.updateBadge());
		this.updateBadge();
		chrome.browserAction.onClicked.addListener(() => this.goToCompetition());
	}

	private async updateBadge(): Promise<string[]> {
		try {
			const compets = await PageParseService.parse(getCompetitionsPage(), this.storage.langWatch);
			this.iconAnimator.showConnected(compets.length);
			return compets;
		} catch (err) {
			console.error(err);
			this.iconAnimator.showDisconnected();
			return [];
		}
	}

	private goToCompetition() {
		this.updateBadge().then((compets) => {
			if (compets.length === 0) {
				this.goToDefaultPage();
			} else {
				this.openCompetitionTab(compets.shift());
			}
		});
	}

	private openCompetitionTab(competition: string) {
		chrome.tabs.create({
			active: true,
			url: getCompetitionURl(competition)
		});
	}

	private goToDefaultPage() {
		chrome.tabs.query(
			{
				url: join(WEBSITE_URL, '*')
			},
			this.openFirstTab
		);
	}

	private openFirstTab(tabs: chrome.tabs.Tab[]) {
		if (tabs.length === 0) {
			chrome.tabs.create({ url: getTypingTestUrl('french') });
		} else {
			chrome.tabs.update(tabs[0].id, {
				active: true
			});
		}
	}
}

const app = new App();

/* var canvas = <HTMLCanvasElement>document.getElementById('canvas'),
// 	loggedInImage = document.getElementById('logged_in'),
// 	canvasContext = canvas.getContext('2d'),
// 	animationFrames = 56,
// 	animationSpeed = 20,
// 	direction = 1,
// 	intervalId = null, // Save the animation interval
// 	resetTimeout = null,
// 	connector; // Reset the animation

// //Don't need the 'favLangName', it's just for the options
// var options = {
// 	favLangVal: '', //No favlang to avoid badmessages display
// 	refreshTimeout: 10,
// 	noCompetition: 0,
// 	loadingAnimation: true,
// 	notification: true,
// 	lastNumberOfCompet: 0
// };
// /*
//  * Click on the browseraction
//  * handler
//  */
// function click() {
// 	connector.clicked();
// 	updateIcon();
// }

// function updateIcon() {
// 	var icon = 'pictures/' + (connector.connected ? 'icon.png' : 'icon_gray.png');
// 	var title = !connector.connected
// 		? tr('not_connected')
// 		: connector.nwCompetitions === 0
// 			? tr('nothing_new')
// 			: connector.nwCompetitions === 1 ? tr('one_new_competition') : tr('new_competitions');
// 	var text = connector.nwCompetitions > 0 ? connector.competitions.length + '' : '';
// 	var badgeColor = connector.nwCompetitions > 0 ? [ 58, 214, 0, 255 ] : [ 0, 0, 0, 0 ];

// 	chrome.browserAction.setBadgeText({ text: text });
// 	chrome.browserAction.setTitle({ title: title });
// 	chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor });
// 	chrome.browserAction.setIcon({ path: icon });
// }

// function notifyNewcompetition(numberOfNew) {
// 	var message = numberOfNew + ' ' + (numberOfNew === 1 ? tr('one_was_created') : tr('several_was_created'));
// 	chrome.notifications.create('1', {
// 		type: 'basic',
// 		iconUrl: './pictures/big_icon.png',
// 		eventTime: 2000,
// 		title: '10fastfingers competition',
// 		message: message
// 	});

// 	//On click ... go to competition
// }

// function Connector() {
// 	this.connected = false;
// 	this.websiteUrl = 'http://10fastfingers.com/';
// 	this.competitions = [];
// 	this.nwCompetitions = 0;
// 	this.valRegex = /\s*var\s+competitions_participated\s*=\s*\[(\"\d+\",)*(\"\d+\")?\];/;

// 	var clearRegexes = [
// 		new RegExp('<script[\\s\\S\\d\\D]*?>[\\s\\S]*?</script>', 'g'), //rm script tags
// 		new RegExp('url\\([\'"][\\d\\D]*?.png[\'"]\\)', 'g'), //rm url attributes in images
// 		new RegExp('<[a-z]*.*?style=[\'"].*?url\\(.*?\\).*?[\'"].*?>.*?<\\/[a-z]*>', 'ig'), //rm anchors
// 		new RegExp('<link[\\d\\D]*?>', 'g') //rm links
// 	];
// 	this.competParticipated;
// 	this.currentTimeout;

// 	var self = this;

// 	//---------------------------------------//
// 	//          PUBLIC FUNCTIONS             //
// 	//---------------------------------------//

// 	/**
//      * Open the necessary tab depending on the state of
//      * the object.
//      * Called whenever the user click on the icon
//      */
// 	this.clicked = function() {
// 		if (options.loadingAnimation) startAnimation();
// 		this.refresh(
// 			function() {
// 				self.refreshCompetitions(options.refreshTimeout);
// 				openFastFingers();
// 				stopAnimation();
// 			},
// 			function() {
// 				if (self.competitions.length > 0) {
// 					openFastFingers(getCompetitionURl(self.competitions[0])); //Open the oldest competition
// 					self.refreshCompetitions(2); //Refresh competition after 2 mn
// 				} else {
// 					self.refresh();
// 					self.openOption();
// 				}
// 				stopAnimation();
// 			}
// 		);
// 	};

// 	/**
//      *
//      * @param {function} notConnectedCallback callback to execute when the user is not connected
//      * @param {function} connectedCallback callback to execute when the user is connected
//      */
// 	this.refresh = function(notConnectedCallback, connectedCallback) {
// 		chrome.cookies.get(
// 			{
// 				url: this.websiteUrl,
// 				name: 'CakeCookie[remember_me_cookie]'
// 			},
// 			function(cookie) {
// 				checkIfConnected(cookie, notConnectedCallback, function() {
// 					if (self.nwCompetitions > options.lastNumberOfCompet && options.notification) {
// 						notifyNewcompetition(self.nwCompetitions - options.lastNumberOfCompet);
// 					}
// 					if (self.nwCompetitions != options.lastNumberOfCompet) {
// 						saveNumberOfCompet(self.nwCompetitions);
// 					}
// 					connectedCallback && connectedCallback.call();
// 				});
// 			}
// 		);
// 	};

// 	/*
//      * Set the alarm
//      * if the timeout is the same as before, nothing changes
//      * if the timeout is different, changin the periodInterval
//      */
// 	this.refreshCompetitions = function(timeout /*in minutes*/) {
// 		timeout = Math.max(timeout, options.refreshTimeout);
// 		chrome.alarms.get('refresh', function(alarm) {
// 			if (alarm) {
// 				chrome.alarms.clear('refresh', function() {
// 					chrome.alarms.create('refresh', { periodInMinutes: timeout });
// 				});
// 			} else {
// 				chrome.alarms.create('refresh', { periodInMinutes: timeout });
// 			}
// 		});
// 	};

// 	/*
//      * Open different pages
//      * depending on the option
//      */
// 	this.openOption = function() {
// 		switch (options.noCompetition | 0) {
// 			case 0: //Open simple test
// 				openFastFingers();
// 				break;
// 			case 1: //Open competition test
// 				openFastFingers('competitions');
// 				break;
// 			default:
// 				openFastFingers();
// 				break;
// 		}
// 	};

// 	/*
//      * Set all the basics options
//      *
//      * For the moment :
//      *  - the language name (English)
//      *  - the language code (english)
//      *  - the timeoutTime (10)
//      *
//      * @param {type} options
//      */

// 	//---------------------------------------//
// 	//          PRIVATE FUNCTIONS                                    //
// 	//---------------------------------------//

// 	/**
//      * Return the id of the flag that can be found ont 10fastfingers
//      * @return {String} the id of the flag as it can be found
//      */
// 	function getFlagId() {
// 		return options.favLangVal ? 'flagid' + (flagsLangId[options.favLangVal] || 1) : '';
// 	}

// 	/**
//      *
//      * @param {Cookie} cookie cookie found by chomre
//      * @param {Function} notConnectedCallback function to execute if not connected
//      * @param {Function} connectedCallback function to execute when connected
//      */
// 	function checkIfConnected(cookie, notConnectedCallback, connectedCallback) {
// 		if (cookie === null) {
// 			//not connected
// 			self.connected = false;
// 			self.refreshCompetitions(1);
// 			notConnectedCallback && notConnectedCallback.call();
// 			updateIcon(); //Directly update icon to warn the user he's not connected
// 		} else {
// 			self.connected = true;
// 			lookForNewCompetitions(connectedCallback);
// 			self.refreshCompetitions(options.refreshTimeout);
// 		}
// 	}

// 	/*
//      * Get the 'competitions' page and process
//      * it to see if there are new competitions
//      * passing by : taking the values of the 'alreadyDone' competitions
//      *
//      * @param {function} endCallback callback to call at the end of the processing
//      */
// 	function lookForNewCompetitions(endCallback) {
// 		var xhr = new XMLHttpRequest();
// 		xhr.open('GET', self.websiteUrl + 'competitions', true);
// 		xhr.onreadystatechange = function() {
// 			if (xhr.readyState === 4) {
// 				// innerText does not let the attacker inject HTML elements.
// 				if (!xhr.responseText || xhr.status !== 200) {
// 					self.connected = false;
// 					updateIcon();
// 					//Hey, you're not connected mate !
// 					return;
// 				}

// 				var res = self.valRegex.exec(xhr.responseText);
// 				if (res && res[0]) {
// 					self.competParticipated = decomposeArray(res[0]);
// 				} else {
// 					self.competParticipated = [];
// 				}

// 				var clearedHTML = cleanHTML(xhr.responseText);
// 				var dummyDiv = document.createElement('DIV');
// 				dummyDiv.innerHTML = clearedHTML;
// 				document.body.appendChild(dummyDiv);
// 				var core = document.getElementById('join-competition-table');
// 				processCore(core.getElementsByTagName('tbody')[0]);
// 				//He's connected and have chances to get new competitions
// 				endCallback && endCallback.call();
// 				updateIcon();
// 			}
// 		};
// 		xhr.send();
// 	}

// 	/*
//      * Check for each competition if already done
//      * and if not, add a new "unDone" competition.
//      */
// 	function processCore(tbody) {
// 		self.nwCompetitions = 0;
// 		self.competitions = [];
// 		var competitions = tbody.getElementsByTagName('tr');
// 		if (getFlagId()) {
// 			for (var i = 0; i < competitions.length; i++) {
// 				checkCompetition(competitions[i]);
// 			}
// 		}
// 		self.refreshCompetitions(options.refreshTimeout); //Refresh to see if there is a new competition every n minutes
// 	}

// 	/*
//      * For one given competition, check if the
//      * competition is in the 'done' list, and if not, add new undone competition.
//      *
//      * @param {DOMObject} compet
//      */
// 	function checkCompetition(compet) {
// 		var informations = compet.getElementsByTagName('td');
// 		var flag = informations[0].getElementsByTagName('span')[0].getAttribute('id');
// 		if (flag === getFlagId()) {
// 			var alreadyDone = informations[2].getElementsByTagName('div')[0].getAttribute('competition_id');
// 			if (self.competParticipated.indexOf(alreadyDone) === -1) {
// 				//Compet not done yet
// 				var ref = informations[1].getElementsByTagName('a')[0].getAttribute('href');
// 				self.nwCompetitions++;
// 				self.competitions.push(ref.substr(1));
// 			}
// 		}
// 	}
// }

// //Open a simple tab with the 'default' page of 10 fast finger : the easy typing test
// function openFastFingers(url) {
// 	chrome.tabs.getAllInWindow(undefined, function(tabs) {
// 		for (var i = 0, tab; (tab = tabs[i]); i++) {
// 			if (tab.url && is10fastFingersUrl(tab.url)) {
// 				chrome.tabs.update(tab.id, {
// 					active: true,
// 					url: url || getTypingTestUrl()
// 				});
// 				return;
// 			}
// 		}
// 		if (url)
// 			if (is10fastFingersUrl(url)) {
// 				chrome.tabs.create({ url: url });
// 			} else {
// 				chrome.tabs.create({ url: getCompetPage() });
// 			}
// 		else chrome.tabs.create({ url: getTypingTestUrl() });
// 	});
// }

// function mergeOption(nwOptions) {
// 	for (var i in nwOptions) {
// 		var nwValue = nwOptions[i].hasOwnProperty('newValue') ? nwOptions[i].newValue : nwOptions[i];
// 		options[i] = isNaN(nwValue) ? nwValue : nwValue | 0;
// 	}
// }

// //Check if the chrome storage is changin to quickly change the icon display.
// function listenToStorage() {
// 	chrome.storage.onChanged.addListener(function(items) {
// 		mergeOption(items);
// 		connector.refresh();
// 	});
// }

// function saveNumberOfCompet(nwNumber) {
// 	chrome.storage.sync.set({
// 		lastNumberOfCompet: nwNumber
// 	});
// 	options.lastNumberOfCompet = nwNumber;
// }

// //Update when navigate in 10fastfingers
// function onNavigate(details) {
// 	if (details.url && is10fastFingersUrl(details.url) && !/competition\//.test(details.url)) {
// 		connector.refresh();
// 	}
// }

// /*
//  * Start everything function
//  *
//  * To be called only once !
//  */
// function init() {
// 	listenToStorage();
// 	chrome.alarms.onAlarm.addListener(function(alarm) {
// 		if (alarm.name === 'refresh') {
// 			connector.refresh();
// 		}
// 	});
// 	chrome.browserAction.onClicked.addListener(function() {
// 		click();
// 	});

// 	//Take out options and let's go !

// 	chrome.storage.sync.get(Object.keys(options), function(items) {
// 		mergeOption(items);
// 		connector.refresh();
// 	});

// 	if (!connector) connector = new Connector();

// 	var filters = {
// 		url: [ { urlContains: connector.websiteUrl.replace(/^http\:\/\//, '') } ]
// 	};

// 	if (
// 		chrome.webNavigation &&
// 		chrome.webNavigation.onDOMContentLoaded &&
// 		chrome.webNavigation.onReferenceFragmentUpdated
// 	) {
// 		chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);
// 		chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, filters);
// 	} else {
// 		chrome.tabs.onUpdated.addListener(function(_, details) {
// 			onNavigate(details);
// 		});
// 	}
// }

// function startAnimation() {
// 	if (intervalId) {
// 		//If animation currently working, stop it
// 		stopAnimation();
// 	} else {
// 		//Reset the canvas
// 		canvasContext.drawImage(loggedInImage, 0, 0);
// 		var currentCol = 0;
// 		direction = 1;
// 		intervalId = setInterval(function() {
// 			if (currentCol >= 19 || currentCol < 0) {
// 				currentCol += direction = -direction;
// 			} else {
// 				negateColumn(currentCol);
// 				currentCol += direction;
// 			}
// 		}, animationSpeed);
// 		resetTimeout = setTimeout(function() {
// 			//We timedout
// 			connector.connected = false;
// 			stopAnimation();
// 		}, 5000);
// 	}
// }

// function stopAnimation() {
// 	intervalId && clearInterval(intervalId);
// 	resetTimeout && clearTimeout(resetTimeout);
// 	resetTimeout = null;
// 	intervalId = null;
// 	updateIcon();
// }

// function negateColumn(n) {
// 	var data = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
// 	for (var col = n * 4; col < data.data.length; col += data.width * 4) {
// 		data.data[col] = 255 - data.data[col];
// 		data.data[col + 1] = 255 - data.data[col + 1];
// 		data.data[col + 2] = 255 - data.data[col + 2];
// 		data.data[col + 3] = 255;
// 	}
// 	canvasContext.putImageData(data, 0, 0);
// 	chrome.browserAction.setIcon({
// 		imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
// 	});
// }

// init();
