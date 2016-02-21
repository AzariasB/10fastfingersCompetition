/* global chrome */


// Saves options to chrome.storage
var availableLang = {
    'albanian': 'Shqip',
    'arabic': 'العربية',
    'armenian': 'Հայերէն',
    'azerbaijani': 'Azərbaycan dili',
    'bulgarian': 'български',
    'catalan': 'Català',
    'simplified-chinese': 'Chinese (Simplified)',
    'traditional-chinese': 'Chinese (Traditional)',
    'croatian': 'Hrvatski',
    'czech': 'čeština',
    'danish': 'Dansk',
    'dutch': 'Nederlands',
    'english': 'English',
    'esperanto': 'Esperanto',
    'estonian': 'Eesti keel',
    'filipino': 'Filipino',
    'finnish': 'Finnish',
    'french': 'Français',
    'galician': 'Galego',
    'georgian': 'ქართული',
    'german': 'Deutsch',
    'greek': 'ελληνικά',
    'hebrew': 'עברית/ עִבְרִית',
    'hindi': 'हिन्दी',
    'hungarian': 'Magyar',
    'icelandic': 'Íslenska',
    'indonesian': 'Bahasa Indonesia',
    'italian': 'Italiano',
    'japanese': '日本語',
    'korean': '한국어',
    'kurdish': 'Kurdí',
    'latvian': 'Latviešu valoda',
    'lithuanian': 'Lietuvių kalba',
    'malaysian': 'Malaysian',
    'norwegian': 'Norsk',
    'pashto': 'پښتو',
    'persian': 'فارسى',
    'polish': 'Polski',
    'portuguese': 'Português',
    'romanian': 'Român',
    'russian': 'Русский язык',
    'serbian': 'Cрпски',
    'slovak': 'Slovenčina',
    'slovenian': 'Slovenščina',
    'spanish': 'Español',
    'swedish': 'Svenska',
    'thai': 'ᥖᥭᥰᥖᥬᥳᥑᥨᥒᥰ',
    'turkish': 'Türkçe',
    'urdu': 'ردو',
    'vietnamese': 'tiếng việt'
};

function tr() {
    return chrome.i18n.getMessage.apply(null, arguments);
}

var noCompet = [tr("goto_test"), tr("goto_competition")];

function byId(id){
    return document.getElementById(id);
}

function initDoc(){
    var idToSet = {
        'main_title' : 'main_title',
        'option1_text' : 'lang_option',
        'option2_text' : 'refresh_option',
        'option3_text' : 'noCompet_option',
        'animation_text' : 'animation_option',
        'notification_text' : 'notification_option',
        'save' : 'confirm_save'
    };

    for(var i in idToSet){
        document.getElementById(i).innerHTML = tr(idToSet[i]);
    }
}

function setOptions() {
    for (var i in availableLang) {
        var opt = document.createElement('OPTION');
        opt.setAttribute('value', i);
        opt.appendChild(document.createTextNode(availableLang[i]));
        document.getElementById('language').appendChild(opt);
    }

    for (var i = 0; i < noCompet.length; i++) {
        var opt = document.createElement('INPUT');
        opt.setAttribute('id',i);
        opt.setAttribute('type','radio')
        opt.setAttribute('name','groupCompet')
        opt.setAttribute('value', noCompet[i]);
        var lab = document.createElement('LABEL');
        lab.setAttribute('for',i);
        lab.appendChild(document.createTextNode(noCompet[i]));
        var formGroup = document.createElement('DIV');
        formGroup.setAttribute('class','form-group');
        formGroup.appendChild(opt);
        formGroup.appendChild(lab);
        document.getElementById('option3').appendChild(formGroup);
    }
}

function save_options() {
    var el = document.getElementById('language'),
        noComp = document.querySelector('input[name="groupCompet"]:checked'),
        languageVal = el.value,
        languageName = el.options[el.selectedIndex].text,
        refreshing = parseInt(document.getElementById('refreshing').value),
        noCompetition = noComp.id,
        loadingAnim = document.getElementById('animation').checked,
        notif = document.getElementById('notification').checked;
    chrome.storage.sync.set({
        favLangVal: languageVal,
        favLangName: languageName,
        refreshTimeout: refreshing,
        noCompetition: noCompetition,
        loadingAnimation : loadingAnim,
        notification : notif
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = tr('option_saved');
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
        favLangVal: 'english',
        favLangName: 'English',
        refreshTimeout: 10,
        noCompetition: 0,
        loadingAnimation : true,
        notification : true
    }, function (items) {
        document.getElementById('language').value = items.favLangVal;
        document.getElementById('refreshing').value = items.refreshTimeout;
        var noCompetOptions = document.getElementsByName('groupCompet');
        var indexChecked = items.noCompetition;
        for(var i = 0; i < noCompetOptions.length;i++){
          noCompetOptions[i].checked = (indexChecked|0 === i);
        }
        document.getElementById('animation').checked = items.loadingAnimation;
        document.getElementById('notification').checked = items.notification;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

initDoc();
setOptions();
