/*
 * The MIT License
 *
 * Copyright 2023 AzariasB.
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

import { IconAnimator } from "./IconAnimator";
import { PageParseService } from "./PageParserService";
import {
  getCompetitionsPage,
  getCompetitionURl,
  getAlternatePage,
  join,
  tr,
  NOTIFICATION_TIME,
  WEBSITE_URL,
  BIG_ICON,
  CREATE_COMPETITION_URL,
  isCompetitionSave,
  getDisplayedCompetitions,
  isEmptyTab,
  extractCompetitionUrl,
  availableLang,
} from "../common";
import { setupAlarm } from "./alarm";
import { StorageService } from "./StorageService";
import { Requester } from "./Requester";

/**
 * Main class of the extension, used to coordinate
 * all the elements : the alarm, the storage and the icon
 */
class App {
  private readonly iconAnimator: IconAnimator;
  private readonly storage: StorageService;

  constructor() {
    this.storage = new StorageService();
    setupAlarm(
      () => this.storage.checkTimeout,
      () => this.updateBadge(),
    );

    this.iconAnimator = new IconAnimator();
    this.storage.init().then(() => {
      this.updateBadge();
    });
    chrome.storage.onChanged.addListener((items) => {
      this.storage.updateConfig(items);
      this.updateBadge();
    });
    chrome.action.onClicked.addListener(() => this.goToCompetition());
    chrome.notifications.onClicked.addListener((notifId) => {
      chrome.notifications.clear(notifId);
      this.goToCompetition();
    });
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        if (isCompetitionSave(details)) {
          this.updateBadge();
        }
      },
      {
        urls: ["*://10fastfingers.com/*"],
      },
    );
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        chrome.runtime.openOptionsPage();
      }
    });
  }

  /**
   * uses the page parser to get the available competitions, and update
   * the extension badge, notify the user if a new competition was created
   */
  private async updateBadge(): Promise<string[]> {
    try {
      const tabs = (await this.getWebsiteTabs()).map((t) => t.url);
      const allCompets = await PageParseService.parse(
        getCompetitionsPage(),
        this.storage.langWatch,
      );
      //Filter out the competition already opened
      const compets = allCompets.filter(
        (x) => !tabs.some((t) => (t?.indexOf(x) ?? -1) > -1),
      );
      const shownCompetitions = await getDisplayedCompetitions();
      this.iconAnimator.showConnected(compets.length);
      if (shownCompetitions === 0 && compets.length) {
        this.notifyCompetCreation();
      }
      return compets;
    } catch (err) {
      console.error(err);
      this.iconAnimator.showDisconnected();
      return [];
    }
  }
  /**
   * creates a notification
   * only if the option is on
   */
  private notifyCompetCreation() {
    if (!this.storage.notifyOnCreation) return;
    chrome.notifications.create({
      type: "basic",
      iconUrl: BIG_ICON,
      eventTime: NOTIFICATION_TIME,
      title: "10fastfingers competition",
      message: tr("one_was_created"),
      isClickable: true,
    });
  }

  /**
   * When the extension icon is clicked it competitions are available
   * goes to the oldest
   * Otherwise, go to the alternative page, chosen by the user
   */
  private async goToCompetition(): Promise<void> {
    try {
      const competitions = await this.updateBadge();
      if (competitions.length === 0) {
        const createdOne = await this.tryCreateCompetition();
        if (!createdOne) await this.goToAlternativePage();
      } else {
        await this.openCompetitionTab(competitions.shift()!);
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * Tries to create a competition, and if success,
   * will go to the created competition
   */
  private async tryCreateCompetition(): Promise<boolean> {
    if (!this.storage.createIfPossible) return false;
    const langId = availableLang[this.storage.websiteLanguage].flagId;
    const formData = new URLSearchParams(`speedtest_id=${langId}&privacy=0`);
    try {
      const resp = await Requester.post(CREATE_COMPETITION_URL, formData);
      const json = await resp.json();
      if (json.url) {
        const competitionUrl = extractCompetitionUrl(json.url);
        if (competitionUrl) {
          await this.updateOrOpenTab(competitionUrl);
          return true;
        }
      }
    } catch (ex) {
      console.error(ex);
      return false;
    }
    return false;
  }

  private async openCompetitionTab(
    competition: string,
  ): Promise<chrome.tabs.Tab> {
    const url = getCompetitionURl(competition);
    return await this.updateOrOpenTab(url);
  }

  /**
   * Queries the tabs of chrome where the
   * url is 10fastfingers, used when no competitions
   * were found
   */
  private async goToAlternativePage(): Promise<chrome.tabs.Tab> {
    const url = join(
      WEBSITE_URL,
      getAlternatePage(this.storage.openOption, this.storage.websiteLanguage),
    );
    return await this.updateOrOpenTab(url);
  }

  private async updateOrOpenTab(url: string): Promise<chrome.tabs.Tab> {
    const tabs = await this.getWebsiteTabs();
    return await this.openFirstTab(tabs, url);
  }

  /**
   * Gets all the tab containing the 10fastfingers url
   */
  private async getWebsiteTabs(): Promise<chrome.tabs.Tab[]> {
    return new Promise((res) => {
      chrome.tabs.query(
        {
          url: join(WEBSITE_URL, "*"),
        },
        (tabs) => res(tabs),
      );
    });
  }

  /**
   * Opens the first tab with an alternative page
   * if the list is empty, creates a new tab
   */
  private async openFirstTab(
    tabs: chrome.tabs.Tab[],
    url: string,
  ): Promise<chrome.tabs.Tab> {
    if (tabs.length === 0) {
      return await this.openFocusedTab(url);
    } else {
      return new Promise((res) => {
        chrome.tabs.update(
          tabs[0].id!,
          {
            active: true,
            url,
          },
          (t) => res(t!),
        );
      });
    }
  }

  /**
   * Opens a single tab with the given URL
   */
  private async openFocusedTab(url: string): Promise<chrome.tabs.Tab> {
    return new Promise((res) => {
      chrome.tabs.query({ active: true }, (tabs) => {
        const tab = tabs?.[0];
        if (isEmptyTab(tab)) {
          chrome.tabs.update(
            tab.id ?? 0,
            {
              active: true,
              url: url,
            },
            (tab) => tab && res(tab),
          );
        } else {
          chrome.tabs.create(
            {
              active: true,
              url,
            },
            (tab) => res(tab),
          );
        }
      });
    });
  }
}

new App();
