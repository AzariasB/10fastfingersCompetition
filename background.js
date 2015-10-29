

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


/* global chrome, competitions_participated */
var flagsLang = {"English": 1, "German": 2, "French": 3, "Portuguese": 4, "Spanish": 5, "Indonesian": 6, "Turkish": 7, "Vietnamese": 8, "Polish": 9, "Romanian": 10, "Malaysian": 11, "Norwegian": 12, "Persian": 13, "Hungarian": 14, "Chinese (Traditional)": 15, "Chinese (Simplified)": 16, "Danish": 17, "Dutch": 18, "Swedish": 19, "Italian": 20, "Finnish": 21, "Serbian": 22, "Catalan": 23, "Filipino": 24, "Croatian": 25, "Russian": 26, "Arabic": 27, "Bulgarian": 28, "Japanese": 29, "Korean": 31, "Greek": 32, "Czech": 33, "Estonian": 34, "Latvian": 35, "Hebrew": 36, "Urdu": 37, "Galician": 38, "Lithuanian": 39, "Georgian": 40, "Armenian": 41, "Kurdish": 42, "Azerbaijani": 43, "Hindi": 44, "Slovak": 45, "Slovenian": 46, "Icelandic": 48, "Thai": 50, "Pashto": 51, "Esperanto": 52};

var connector = new Connector();


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
function setOptions(options) {
    languageTextName = options.favLangName || languageTextName;
    languageTestVal = options.favLangVal || languageTestVal;
    refreshTimeout = parseInt(options.refreshTimeout) || refreshTimeout;
}

/*
 * Start everything function
 * 
 * To be called only once !
 */
function init() {
    listenToStorage();
    chrome.alarms.onAlarm.addListener(function (alarm) {//Add alarm listener
        connector.refresh();
    });
    chrome.browserAction.onClicked.addListener(function () {//Add click listnere
        click();
    });

    //Take out options and let's go !
    chrome.storage.sync.get(['favLangName', 'favLangVal', 'refreshTimeout'], function (items) {
        setOptions(items);
        connector.refresh();
    });
}

/*
 * Click on the browseraction
 * handler
 */
function click() {
    connector.refresh(function () {
        if (connector.connected) {
            if (connector.nwCompetitions > 0) {
                openCompetition(connector.lastCompetition);
                connector.refreshCompetitions(1.2); //Refresh competition after 2 minutes of going in
            } else {
                openFastFingers();
            }
        }
    });
}


function Connector() {
    this.connected = false;
    this.websiteUrl = 'http://10fastfingers.com/';
    this.lastCompetition;
    this.nwCompetitions = 0;
    this.languageTestVal = 'english';
    this.languageTextName = 'English';
    this.refreshTimeout = 10;
    this.valRegex = /\s*var\s+competitions_participated\s*=\s*\[(\"\d+\",)*(\"\d+\")?\];/;
    this.scripReg = new RegExp('<script[\\s\\S\\d\\D]*?>[\\s\\S]*?</script>', 'g');
    this.linkReg = new RegExp('<link[\\d\\D]*?>', 'g');
    this.competParticipated;
    this.currentTimeout;

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

    this.refresh = function (callback) {
        chrome.cookies.get({
            'url': this.websiteUrl,
            'name': 'CakeCookie[rememberMe]'
        }, function (cookie) {
            checkIfConnected(cookie, callback);
        });
    };

    /*
     * Set the alarm
     * if the timeout is the same as before, nothing changes
     * if the timeout is different, changin the periodInterval
     */
    this.refreshCompetitions = function (timeout/*in minutes*/) {
        chrome.alarms.get('refresh', function (alarm) {
            if (alarm) {
                if (alarm.periodInMinutes !== timeout) {
                    chrome.alarms.clear('refresh', function () {
                        chrome.alamrs.create('refresh', {periodInMinutes: timeout});
                    });
                }
            } else {
                chrome.alarms.create('refresh', {periodInMinutes: timeout});
            }
        });
    };

    this.is10fastFingersUrl = function (url) {
        return url.indexOf(this.websiteUrl) === 0;
    };

    this.getCompetitionURl = function (competRef) {
        return this.websiteUrl + competRef;
    };

    this.getTypingTestUrl = function () {
        return this.websiteUrl + 'typing-test/' + languageTestVal;
    };


    //---------------------------------------//
    //          PRIVATE FUNCTIONS            //
    //---------------------------------------//

    function getFlagId() {
        return 'flagid' + flagsLang[languageTextName];
    }

    //Remove all scripts tag of the text
    function removeScript(text) {
        return text.replace(self.scripReg, "");
    }

    //Remove all links tag of the text
    function removeLink(text) {
        return text.replace(self.linkReg, "");
    }

    function cleanHTML(html) {
        return removeLink(removeScript(html));
    }

    /*
     * Handler when the cookie is found
     * 
     * @param {Cookie} cookie
     */
    function checkIfConnected(cookie, callback) {
        if (cookie === null) {//not connected
            connected = false;
            chrome.browserAction.setIcon({path: "icon _gray.png"});
            chrome.browserAction.setTitle({title: "Not connected to 10fastfingers"});
            chrome.browserAction.setBadgeBackgroundColor({color: [190, 190, 190, 230]});
            chrome.browserAction.setBadgeText({text: "?"});
            refreshCompetitions(refreshTimeout);
        } else {
            connected = true;
            lookForNewCompetitions(callback);
        }
    }

    /*
     * Get the 'competitions' page and process
     * it to see if there are new competitions
     * passing by : taking the values of the 'alreadyDone' competitions
     */
    function lookForNewCompetitions(callback) {
        if (HTMLinXHR()) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", self.websiteUrl + "competitions", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    // innerText does not let the attacker inject HTML elements.
                    var res = self.valRegex.exec(xhr.responseText);
                    eval(res[0]);//Get "competition_participated" var.
                    self.competParticipated = competitions_participated;
                    var clearedHTML = cleanHTML(xhr.responseText);
                    var dummyDiv = document.createElement('DIV');
                    dummyDiv.innerHTML = clearedHTML;
                    document.body.appendChild(dummyDiv);
                    var core = document.getElementById('join-competition-table');
                    processCore(core.getElementsByTagName('tbody')[0]);
                    callback && callback();
                }
            };
            xhr.send();
        } else {
            console.log("Not possible");
        }
    }

    /*
     * Check for each competition if already done
     * and if not, add a new "unDone" competition.
     */
    function processCore(tbody) {
        self.nwCompetitions = 0;
        var competitions = tbody.getElementsByTagName('tr');
        for (var i = 0; i < competitions.length; i++) {
            checkCompetition(competitions[i]);
        }
        if (this.nwCompetitions > 0 && lastCompetition) {
            chrome.browserAction.setTitle({title: self.nwCompetitions === 1 ? 'There is a new competition' :
                        'There are new competitions'});
            chrome.browserAction.setBadgeBackgroundColor({color: [58, 214, 0, 255]});
        } else {
            chrome.browserAction.setTitle({title: 'Not new competitions'});
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
        }
        chrome.browserAction.setBadgeText({text: (self.nwCompetitions === 0 ? "" : (self.nwCompetitions + ""))});
        self.refreshCompetitions(refreshTimeout);//Refresh to see if there is a new competition every 10 minutes
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
                nwCompetitions++;
                self.lastCompetition = ref.substr(1);
            }
        }
    }


}

//check if we really have a html-like response
function HTMLinXHR() {
    if (!window.XMLHttpRequest)
        return false;
    var req = new window.XMLHttpRequest();
    req.open('GET', connector.websiteUrl + 'competitions', false);
    try {
        req.responseType = 'document';
    } catch (e) {
        return true;
    }
    return false;
}

//Open a simple tab with the 'default' page of 10 fast finger : the easy typing test
function openFastFingers() {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && connector.is10fastFingersUrl(tab.url)) {
                chrome.tabs.update(tab.id, {active: true});
                return;
            }
        }
        chrome.tabs.create({url: connector.getTypingTestUrl()});
    });
}

//Open the competition to the given id
//The id must contain the 'competition/' url
function openCompetition(competitionId) {
    chrome.tabs.create({url: connector.getCompetitionURl(competitionId)});
}

//Check if the chrome storage is changin to quickly change the icon display.
function listenToStorage() {
    chrome.storage.onChanged.addListener(function (items) {
        connector.languageTestVal = (items.favLangVal ? items.favLangVal.newValue : languageTestVal);
        connector.languageTextName = (items.favLangName ? items.favLangName.newValue : languageTextName);
        connector.refreshTimeout = (items.refreshTimeout ? items.refreshTimeout.newValue : refreshTimeout);
        connector.refresh();
    });
}

init();
