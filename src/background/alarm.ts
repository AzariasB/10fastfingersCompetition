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

import { ALARM_NAME } from "../common";

function alarmCallback(
  timeout: () => number,
  callback: () => Promise<unknown>,
) {
  return async (alarm: chrome.alarms.Alarm) => {
    if (alarm.name != ALARM_NAME) return;
    await callback();
    const exists = await chrome.alarms.get(ALARM_NAME);
    if (!exists) {
      await chrome.alarms.create(ALARM_NAME, { delayInMinutes: timeout() });
    }
    return true;
  };
}

export async function setupAlarm(
  timeout: () => number,
  callback: () => Promise<any>,
) {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, { delayInMinutes: timeout() });
  }

  chrome.alarms.onAlarm.addListener(alarmCallback(timeout, callback));
}
