/* global chrome */


// Saves options to chrome.storage
var availableLang = {
    'albanian': 'Albanian',
    'arabic': 'Arabic',
    'armenian': 'Armenian',
    'azerbaijani': 'Azerbaijani',
    'bulgarian': 'Bulgarian',
    'catalan': 'Catalan',
    'simplified-chinese' : 'Chinese (Simplified)',
    'traditional-chinese' : 'Chinese (Traditional)',
    'croatian': 'Croatian',
    'czech': 'Czech',
    'danish': 'Danish',
    'dutch': 'Dutch',
    'english': 'English',
    'esperanto': 'Esperanto',
    'estonian': 'Estonian',
    'filipino': 'Filipino',
    'finnish': 'Finnish',
    'french': 'French',
    'galician': 'Galician',
    'georgian': 'Georgian',
    'german': 'German',
    'greek': 'Greek',
    'hebrew': 'Hebrew',
    'hindi': 'Hindi',
    'hungarian': 'Hungarian',
    'icelandic': 'Icelandic',
    'indonesian': 'Indonesian',
    'italian': 'Italian',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'kurdish': 'Kurdish',
    'latvian': 'Latvian',
    'lithuanian': 'Lithuanian',
    'malaysian': 'Malaysian',
    'norwegian': 'Norwegian',
    'pashto': 'Pashto',
    'persian': 'Persian',
    'polish': 'Polish',
    'portuguese': 'Portuguese',
    'romanian': 'Romanian',
    'russian': 'Russian',
    'serbian': 'Serbian',
    'slovak': 'Slovak',
    'slovenian': 'Slovenian',
    'spanish': 'Spanish',
    'swedish': 'Swedish',
    'thai': 'Thai',
    'turkish': 'Turkish',
    'urdu': 'Urdu',
    'vietnamese': 'Vietnamese'
};

function setOptions() {
    for (var i in availableLang) {
        var opt = document.createElement('OPTION');
        opt.setAttribute('value', i);
        opt.appendChild(document.createTextNode(availableLang[i]));
        document.getElementById('language').appendChild(opt);
    }
}

function save_options() {
    var el = document.getElementById('language');
    
    var languageVal = el.value;
    var languageName = el.options[el.selectedIndex].text;
    var refreshing = parseInt(document.getElementById('refreshing').value);
    chrome.storage.sync.set({
        favLangVal : languageVal,
        favLangName : languageName,
        refreshTimeout : refreshing
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 2000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        favLangVal : 'english',
        favLangName : 'English',
        refreshTimeout : 10
    }, function (items) {
        document.getElementById('language').value = items.favLangVal;
        document.getElementById('refreshing').value = items.refreshTimeout;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

setOptions();