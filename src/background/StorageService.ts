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

import { Config, OpenOption, DEFAULT_CONFIG } from "../common/common";

/**
 * Service used to interface with chrome sync storage
 * has the default configuration saved when none is found
 * will merge this default configu with anything that's already
 * saved
 * Has a direct accessor for each config element
 */
export class StorageService {
  private config: Config;

  public async init(): Promise<void> {
    this.config = DEFAULT_CONFIG;
    const items = await this.getConfig();
    if (!items || !items.version) await this.saveConfig(this.config);
    else this.updateConfig(items);
  }

  /**
   * Retrieves the config in the sync memory
   */
  private async getConfig(): Promise<Config> {
    return chrome.storage.sync.get() as Promise<Config>;
  }

  /**
   * Saves the config in the sync storage
   */
  private async saveConfig(item: Config): Promise<Config> {
    await chrome.storage.sync.set(item);
    return item;
  }

  /**
   * Merges the current config object with
   * the given items
   */
  public updateConfig(items: Record<string, any>) {
    Object.keys(this.config).map((k) => {
      if (items[k] !== undefined) {
        if (items[k].newValue === undefined) {
          this.config[k] = items[k];
        } else {
          this.config[k] = items[k].newValue;
        }
      }
    });
  }

  /**
   * Accessor for each config element
   */

  public get checkTimeout(): number {
    return this.config.checkTimeout;
  }

  public get langWatch(): string[] {
    return this.config.langWatch;
  }

  public get openOption(): OpenOption {
    return this.config.openOption;
  }

  public get notifyOnCreation(): boolean {
    return this.config.notifyOnCreation;
  }

  public get websiteLanguage(): string {
    return this.config.websiteLanguage;
  }

  public get animateIcon(): boolean {
    return this.config.animateIcon;
  }

  public get createIfPossible(): boolean {
    return this.config.createIfPossible;
  }
}
