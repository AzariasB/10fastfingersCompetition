import { ALARM_NAME } from "./common";

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

export class Alarm {
  constructor(
    private timeout: () => number,
    private _callback: () => Promise<any>
  ) {
    chrome.alarms.get(ALARM_NAME, (alarm) => {
      if (!alarm) {
        chrome.alarms.create(ALARM_NAME, {
          delayInMinutes: timeout(),
        });
      }
    });
    chrome.alarms.onAlarm.addListener(async (a) => {
      await this.callAlarm(a);
      return true;
    });
  }

  private async callAlarm(
    alarm: chrome.alarms.Alarm
  ): Promise<boolean | undefined> {
    if (alarm.name != ALARM_NAME) return;
    if (this._callback) await this._callback();
    return new Promise((res) => {
      chrome.alarms.get(ALARM_NAME, (alarm) => {
        if (!alarm) {
          chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: this.timeout(),
          });
          res(true);
        }
        res(false);
      });
    });
  }
  public set callback(nwCallback: () => Promise<any>) {
    this._callback = nwCallback;
  }
}
