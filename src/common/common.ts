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

import { CONFIG_VERSION, WEBSITE_URL, join } from "./constants";

/**
 * Faster translator access
 */
export const tr = chrome.i18n.getMessage;

export enum OpenOption {
  OpenTestPage = "open_test_page",
  OpenCompetitionPage = "open_competition_page",
  OpenAdvanced = "open_advanced_page",
  OpenCustom = "open_custom_page",
  OpenMultiPlayer = "open_multiplayer_page",
  OpenTextPractice = "open_text_practice_page",
  OpenTop1000 = "open_top_1000_page",
}

export interface Config {
  version: number;
  checkTimeout: number;
  langWatch: string[];
  websiteLanguage: string;
  openOption: OpenOption;
  notifyOnCreation: boolean;
  animateIcon: boolean;
  createIfPossible: boolean;
}

const PAGES_URL = {
  [OpenOption.OpenTestPage]: "typing-test",
  [OpenOption.OpenAdvanced]: "advanced-typing-test",
  [OpenOption.OpenCompetitionPage]: "competitions",
  [OpenOption.OpenCustom]: "widgets/typingtest",
  [OpenOption.OpenMultiPlayer]: "multiplayer",
  [OpenOption.OpenTextPractice]: "text-practice/new",
  [OpenOption.OpenTop1000]: "top1000",
};

const EMPY_TAB_REGEX = /^chrome:\/\/newtab?\/$/;
const VALID_URL_REGEX = /^https:\/\/10fastfingers\.com(\/.*)?$/;
const COMPETITION_URL_REGEX =
  /https:\/\/10fastfingers\.com\/competition\/[a-z0-9]+/i;

export const DEFAULT_CONFIG: Config = {
  version: CONFIG_VERSION,
  checkTimeout: 5,
  langWatch: ["english"],
  openOption: OpenOption.OpenTestPage,
  notifyOnCreation: false,
  animateIcon: true,
  websiteLanguage: "english",
  createIfPossible: true,
};

/**
 * Checks if the given string contains, at the begining, the adress
 * of 10fastfingers
 */
export const is10fastFingersUrl = (url: string): boolean =>
  VALID_URL_REGEX.test(url);

/**
 * Full URL of the competition
 *
 * @param competitionUrl path of the competition
 */
export const getCompetitionURl = (competitionUrl: string): string =>
  join(WEBSITE_URL, competitionUrl);

/**
 * URL of the basic typing test
 *
 * @param language language of the typing test
 */
export const getTypingTestUrl = (language: string = "english"): string =>
  join(WEBSITE_URL, PAGES_URL[OpenOption.OpenTestPage], language);

/**
 * URL of the page containing the list of all competitions
 */
export const getCompetitionsPage = (): string =>
  join(WEBSITE_URL, PAGES_URL[OpenOption.OpenCompetitionPage]);

/**
 * Gets the alternative page URL, when there is no competition, the lang
 * parameter is only used for some of these pages
 */
export const getAlternatePage = (opOp: OpenOption, lang: string) => {
  switch (opOp) {
    case OpenOption.OpenAdvanced:
    case OpenOption.OpenTestPage:
      return join(PAGES_URL[opOp], lang);
    default:
      return PAGES_URL[opOp];
  }
};

/**
 * Whenever a chrome request is received, checks it is the request
 * sent when a competition is completed by the user
 */
export function isCompetitionSave(
  details: chrome.webRequest.WebResponseCacheDetails,
) {
  return (
    details.initiator &&
    details.initiator.indexOf(WEBSITE_URL) != -1 &&
    details.method === "POST" &&
    details.type === "xmlhttprequest" &&
    details.url.endsWith("save_result")
  );
}

/**
 * Checks wether the given tab is a new empty tab
 * so it can be used for something else
 *
 * @param tab tab that can be empty
 */
export function isEmptyTab(tab: chrome.tabs.Tab): boolean {
  return tab && EMPY_TAB_REGEX.test(tab.url ?? "");
}

/**
 * Text displayed on the browseraction icon,
 * 0 if no text is displayed, or the text is not a number
 */
export async function getDisplayedCompetitions(): Promise<number> {
  return chrome.action.getBadgeText({}).then((text) => {
    if (!text || !text.length) return 0;
    const toNumber = +text;
    if (isNaN(toNumber)) return 0;
    return toNumber;
  });
}

/**
 * Instead of using the all mighty-dangerous eval,
 * this function will decompose the string to find the values of the array
 *
 * @param {string} stringArray a string looking like var array_name = [value1,value2,...]
 * @returns the array formed from the string
 */
export function parseJsArray(stringArray: string): number[] {
  //If emptry string or empty value, return empty array
  if (!stringArray || !stringArray.length) return [];
  const brackIndex = stringArray.indexOf("[");
  const closeIndex = stringArray.indexOf("]");
  stringArray = stringArray.substring(brackIndex + 1, closeIndex);
  if (stringArray.length === 0) return [];
  return stringArray.split(/,\s*/).map((x) => +x.slice(1, x.length - 1));
}

export function extractCompetitionUrl(startUrl: string): string | null {
  const extracted = COMPETITION_URL_REGEX.exec(startUrl);
  if (extracted === null) return null;
  return extracted[0];
}
