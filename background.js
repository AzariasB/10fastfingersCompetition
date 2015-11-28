

/*
 * TODO : 
 * -internationalize
 * -pretify
 * -add more options :
 *  - active/not active
 *  - listen to multiples competitions ?
 *  
 * -suggestions
 * 
 */


//Translate faster, shorter
function tr() {
    return chrome.i18n.getMessage.apply(this, arguments);
}

/* global chrome, competitions_participated */
var flagsLangId = {"english": 1, "german": 2, "french": 3, "portuguese": 4, "spanish": 5, "indonesian": 6, "turkish": 7, "vietnamese": 8, "polish": 9, "romanian": 10, "malaysian": 11, "norwegian": 12, "persian": 13, "hungarian": 14, "chinese (Traditional)": 15, "chinese (Simplified)": 16, "danish": 17, "dutch": 18, "swedish": 19, "italian": 20, "finnish": 21, "serbian": 22, "catalan": 23, "filipino": 24, "croatian": 25, "russian": 26, "arabic": 27, "bulgarian": 28, "japanese": 29, "korean": 31, "greek": 32, "czech": 33, "estonian": 34, "latvian": 35, "hebrew": 36, "urdu": 37, "galician": 38, "lithuanian": 39, "georgian": 40, "armenian": 41, "kurdish": 42, "azerbaijani": 43, "hindi": 44, "slovak": 45, "slovenian": 46, "icelandic": 48, "thai": 50, "pashto": 51, "esperanto": 52};
var connector = new Connector();

/*
 * Click on the browseraction
 * handler
 */
function click() {
    console.log(connector.competitions);
    if (connector.connected) {
        console.log("Connected", connector.competitions.length);
        if (connector.competitions.length > 0) {
            (connector.competitions.length + 1) < connector.nwCompetitions && connector.refresh();
            openFastFingers(getCompetitionURl(connector.competitions.pop()));
            connector.refreshCompetitions(10); //Refresh competition after 10 minutes of going in

        } else {
            connector.refresh();
            connector.openOption();
        }
    } else {
        console.log("not connected");
        connector.refresh();
        connector.refreshCompetitions(connector.refreshTimeout);
        openFastFingers();
    }

    updateIcon();
}


function updateIcon() {
    if (!connector.connected) {
        chrome.browserAction.setIcon({path: "pictures/icon_gray.png"});
        chrome.browserAction.setTitle({title: tr("not_connected")});
        chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
        chrome.browserAction.setBadgeText({text: ""});
    } else {
        chrome.browserAction.setIcon({path: "pictures/icon.png"});
        if (connector.nwCompetitions > 0 && connector.competitions) {
            chrome.browserAction.setTitle({title: connector.nwCompetitions === 1 ? tr("one_new_competition") :
                        tr("new_competitions")});
            chrome.browserAction.setBadgeBackgroundColor({color: [58, 214, 0, 255]});
            chrome.browserAction.setBadgeText({text: (connector.competitions.length === 0 ? "" : (connector.competitions.length + ""))});
        } else {
            chrome.browserAction.setTitle({title: tr('nothing_new')});
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
        }
    }
}

function Connector() {
    this.connected = false;
    this.websiteUrl = 'http://10fastfingers.com/';
    this.competitions = [];
    this.nwCompetitions = 0;
    this.languageTestVal = 'english';
    this.refreshTimeout = 10;
    this.valRegex = /\s*var\s+competitions_participated\s*=\s*\[(\"\d+\",)*(\"\d+\")?\];/;
    this.scripReg = new RegExp('<script[\\s\\S\\d\\D]*?>[\\s\\S]*?</script>', 'g');
    this.imgReg = new RegExp('url\\([\'"][\\d\\D]*?.png[\'"]\\)', 'g');
    this.linkReg = new RegExp('<link[\\d\\D]*?>', 'g');
    this.competParticipated;
    this.currentTimeout;
    this.noCompet = "";

    var self = this;


    //---------------------------------------//
    //          PUBLIC FUNCTIONS             //
    //---------------------------------------//
    /*
     * Check if the user is connected to the website,
     * if he is, check for new competitions
     * 
     * @param {function} callback
     */

    this.refresh = function () {
        console.log("Refreshing...");
        chrome.cookies.get({
            'url': this.websiteUrl,
            'name': 'CakeCookie[rememberMe]'
        }, function (cookie) {
            checkIfConnected(cookie);
        });
    };

    /*
     * Set the alarm
     * if the timeout is the same as before, nothing changes
     * if the timeout is different, changin the periodInterval
     */
    this.refreshCompetitions = function (timeout/*in minutes*/) {
        timeout = Math.max(timeout, this.refreshTimeout);
        chrome.alarms.get('refresh', function (alarm) {
            if (alarm) {
                chrome.alarms.clear('refresh', function () {
                    chrome.alarms.create('refresh', {periodInMinutes: timeout});
                });

            } else {
                chrome.alarms.create('refresh', {periodInMinutes: timeout});
            }
        });
    };

    /*
     * Open different pages
     * depending on the option
     */
    this.openOption = function () {
        switch (this.noCompet) {
            case 0 ://Open simple test
                openFastFingers();
                break;
            case 1: //Open competition test
                openFastFingers('competiontions');
                break;
            default:
                openFastFingers();
                break;
        }
    };

    /*
     * Set all the basics options
     * 
     * For the moment :
     *  - the language name (English)
     *  - the language code (english)
     *  - the timeoutTime (10)
     * 
     * @param {type} options
     */
    this.setOptions = function (options) {
        this.languageTestVal = options.favLangVal || this.languageTestVal;
        this.refreshTimeout = parseInt(options.refreshTimeout) || this.refreshTimeout;
        this.noCompet = parseInt(options.noCompetition) || this.noCompet;
    };

    //---------------------------------------//
    //          PRIVATE FUNCTIONS            //
    //---------------------------------------//

    function getFlagId() {
        return 'flagid' + (flagsLangId[self.languageTestVal] || 1);
    }

    //Remove all scripts tag of the text
    function removeScript(text) {
        return text.replace(self.scripReg, "");
    }

    //Remove all links tag of the text
    function removeLink(text) {
        return text.replace(self.linkReg, "");
    }

    function removePictures(text) {
        return text.replace(self.imgReg, "");
    }

    function cleanHTML(html) {
        return removePictures(
                removeLink(
                        removeScript(html)));
    }

    /*
     * Handler when the cookie is found
     * 
     * @param {Cookie} cookie
     */
    function checkIfConnected(cookie) {
        if (cookie === null) {//not connected
            self.connected = false;
            self.refreshCompetitions(1);
        } else {
            self.connected = true;
            lookForNewCompetitions();
            self.refreshCompetitions(self.refreshTimeout);
        }
        updateIcon();
    }

    /*
     * Get the 'competitions' page and process
     * it to see if there are new competitions
     * passing by : taking the values of the 'alreadyDone' competitions
     */
    function lookForNewCompetitions() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", self.websiteUrl + "competitions", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // innerText does not let the attacker inject HTML elements.
                if (!xhr.responseText) {
                    self.connected = false;
                    updateIcon();
                    return;
                }
                var res = self.valRegex.exec(xhr.responseText);
                if (res && res[0]) {
                    eval(res[0]);
                    self.competParticipated = competitions_participated || [];
                } else {
                    self.competParticipated = [];
                }

                var clearedHTML = cleanHTML(xhr.responseText);
                var dummyDiv = document.createElement('DIV');
                dummyDiv.innerHTML = clearedHTML;
                document.body.appendChild(dummyDiv);
                var core = document.getElementById('join-competition-table');
                processCore(core.getElementsByTagName('tbody')[0]);
            }
        };
        xhr.send();
    }

    /*
     * Check for each competition if already done
     * and if not, add a new "unDone" competition.
     */
    function processCore(tbody) {
        self.nwCompetitions = 0;
        self.competitions = [];
        var competitions = tbody.getElementsByTagName('tr');
        for (var i = 0; i < competitions.length; i++) {
            checkCompetition(competitions[i]);
        }
        updateIcon();
        self.refreshCompetitions(self.refreshTimeout);//Refresh to see if there is a new competition every 10 minutes
    }

    /*
     * For one given competition, check if the 
     * competition is in the 'done' list, and if not, add new undone competition.
     * 
     * @param {DOMObject} compet
     */
    function checkCompetition(compet) {
        var informations = compet.getElementsByTagName('td');
        var flag = informations[0].getElementsByTagName('span')[0].getAttribute('id');
        if (flag === getFlagId()) {
            var alreadyDone = informations[2].getElementsByTagName('div')[0].getAttribute('competition_id');
            if (self.competParticipated.indexOf(alreadyDone) === -1) {//Compet not done yet
                var ref = informations[1].getElementsByTagName('a')[0].getAttribute('href');
                self.nwCompetitions++;
                self.competitions.push(ref.substr(1));
            }
        }
    }


}

function is10fastFingersUrl(url) {
    return url.indexOf(connector.websiteUrl) === 0;
}

function getCompetitionURl(competRef) {
    return connector.websiteUrl + competRef;
}


function getTypingTestUrl() {
    return connector.websiteUrl + 'typing-test/' + connector.languageTestVal;
}


function getCompetPage() {
    return connector.websiteUrl + 'competitions';
}


//Open a simple tab with the 'default' page of 10 fast finger : the easy typing test
function openFastFingers(url) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && is10fastFingersUrl(tab.url)) {
                chrome.tabs.update(tab.id, {active: true, url: url});
                return;
            }
        }
        if (url)
            if (is10fastFingersUrl(url)) {
                chrome.tabs.create({url: url});
            } else {
                chrome.tabs.create({url: getCompetPage()});
            }
        else
            chrome.tabs.create({url: getTypingTestUrl()});
    });
}


//Check if the chrome storage is changin to quickly change the icon display.
function listenToStorage() {
    chrome.storage.onChanged.addListener(function (items) {
        connector.languageTestVal = (items.favLangVal ? items.favLangVal.newValue : connector.languageTestVal);
        connector.refreshTimeout = (items.refreshTimeout ? items.refreshTimeout.newValue : connector.refreshTimeout);
        connector.noCompet = (items.noCompetition ? items.noCompetition.newValue : connector.noCompet);
        connector.refresh();
    });
}

//Update when navigate in 10fastfingers
function onNavigate(details) {
    if (details.url && is10fastFingersUrl(details.url) && !/competition\//.test(details.url)) {
        connector.refresh();
    }
}

/*
 * Start everything function
 * 
 * To be called only once !
 */
function init() {
//    console.log(chrome.webNavigation,chrome.webNavigation.onDOMContentLoaded,chrome.webNavigation.onReferenceFragmentUpdated);

    listenToStorage();
    chrome.alarms.onAlarm.addListener(function (alarm) {//Add alarm listener
        if (alarm.name === 'refresh') {
            connector.refresh();
        }
    });
    chrome.browserAction.onClicked.addListener(function () {//Add click listnere
        click();
    });

    //Take out options and let's go !
    chrome.storage.sync.get(['favLangVal', 'refreshTimeout', 'noCompetition'], function (items) {
        connector.setOptions(items);
        connector.refresh();
    });

    var filters = {
        url: [{urlContains: connector.websiteUrl.replace(/^https?\:\/\//, '')}]
    };
    if (chrome.webNavigation && chrome.webNavigation.onDOMContentLoaded &&
            chrome.webNavigation.onReferenceFragmentUpdated) {
        chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);
        chrome.webNavigation.onReferenceFragmentUpdated.addListener(
                onNavigate, filters);
    } else {
        chrome.tabs.onUpdated.addListener(function (_, details) {
            onNavigate(details);
        });
    }

}


init();