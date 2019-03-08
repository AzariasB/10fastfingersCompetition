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

import { CONNECTED_ICON, DISCONNECTED_ICON, ANIMATION_SPEED, tr } from './common';

export class IconAnimator {
	private intervalId?: number = null;
	private context: CanvasRenderingContext2D;
	private baseImage: HTMLImageElement;

	constructor(baseImg: HTMLImageElement, canvas: HTMLCanvasElement) {
		this.baseImage = baseImg;
		this.context = canvas.getContext('2d');
	}

	public showConnected(availableCompets: number) {
		const badgeMessage =
			availableCompets == 0 ? tr('nothing_new') : availableCompets == 1 ? tr('one_new') : tr('several_new');
		this.updateBrowserAction(availableCompets ? availableCompets + '' : null, badgeMessage, CONNECTED_ICON);
	}

	public showDisconnected() {
		this.updateBrowserAction(null, 'not_connected', DISCONNECTED_ICON);
	}

	public beginAnimation() {
		if (this.intervalId !== null) return;
		this.context.drawImage(this.baseImage, 0, 0);
		this.intervalId = setInterval(
			(properties: { column: number; direction: number }) => {
				if (properties.column >= this.baseImage.width || properties.column <= 0) {
					properties.direction = -properties.direction;
				} else {
					this.negateColumn(properties.column);
				}
				properties.column += properties.direction;
			},
			ANIMATION_SPEED,
			{ direction: 1, column: 1 }
		);
	}

	private negateColumn(n: number) {
		const data = this.context.getImageData(0, 0, this.baseImage.width, this.baseImage.height);
		for (let col = n * 4; col < data.data.length; col += data.width * 4) {
			data.data[col] = 255 - data.data[col];
			data.data[col + 1] = 255 - data.data[col + 1];
			data.data[col + 2] = 255 - data.data[col + 2];
			data.data[col + 3] = 255;
		}
		this.context.putImageData(data, 0, 0);
		chrome.browserAction.setIcon({
			imageData: this.context.getImageData(0, 0, this.baseImage.width, this.baseImage.height)
		});
	}

	public endAnimation() {
		this.intervalId && clearInterval(this.intervalId);
		chrome.browserAction.setIcon({ path: CONNECTED_ICON });
	}

	private updateBrowserAction(text: string, title: string, iconPath: string) {
		chrome.browserAction.setBadgeText({ text: text || '' });
		chrome.browserAction.setTitle({ title: title });
		chrome.browserAction.setBadgeBackgroundColor({ color: text ? [ 10, 56, 0, 255 ] : [ 0, 0, 0, 0 ] });
		chrome.browserAction.setIcon({ path: iconPath });
	}
}
