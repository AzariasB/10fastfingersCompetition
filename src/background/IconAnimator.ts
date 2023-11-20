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

import { CONNECTED_ICON, DISCONNECTED_ICON, tr } from "../common";

export class IconAnimator {
  constructor() {}

  public showConnected(availableCompets: number) {
    const badgeMessage =
      availableCompets == 0
        ? tr("nothing_new")
        : availableCompets == 1
          ? tr("one_new")
          : tr("several_new");
    this.updateBrowserAction(
      `${availableCompets || ""}`,
      badgeMessage,
      CONNECTED_ICON,
    );
  }

  public showDisconnected() {
    this.updateBrowserAction("", "not_connected", DISCONNECTED_ICON);
  }

  private updateBrowserAction(text: string, title: string, iconPath: string) {
    chrome.action.setBadgeText({ text });
    chrome.action.setTitle({ title });
    chrome.action.setBadgeBackgroundColor({
      color: text ? [10, 56, 0, 255] : [0, 0, 0, 0],
    });
    chrome.action.setIcon({ path: iconPath });
  }
}
