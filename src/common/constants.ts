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

export const CONFIG_VERSION = 1;

/**
 * Simple joiner to 'encode' urls
 */
export const join = (...args: string[]): string => args.join("/");

export const WEBSITE_URL = "https://10fastfingers.com";
export const CREATE_COMPETITION_URL = join(WEBSITE_URL, "competitions", "add");
export const ALARM_NAME = "typingTestRefresh";
export const CONNECTED_ICON = "/img/icon.png";
export const DISCONNECTED_ICON = "/img/icon_gray.png";
export const BIG_ICON = "/img/big_icon.png";
export const OPTION_PAGE = "src/options/index.html";
export const ANIMATION_SPEED = 20;
export const NOTIFICATION_TIME = 2000;
