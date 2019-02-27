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

export const tr = chrome.i18n.getMessage;
export const websiteUrl = 'https://10fastfingers.com';
export const cookieName = 'CakeCookie[remember_me_cookie]';

const typingTestUrl = 'typing-test';
const competitionsUrl = 'competitions';

export const join = (...args: string[]): string => args.join('/');

export const is10fastFingersUrl = (url: string): boolean => url.indexOf(websiteUrl) === 0;

export const getCompetitionURl = (competitionUrl: string): string => join(websiteUrl, competitionUrl);

export const getTypingTestUrl = (language: string = 'english'): string => join(websiteUrl, typingTestUrl, language);

export const getCompetitionsPage = (): string => join(websiteUrl, competitionsUrl);
