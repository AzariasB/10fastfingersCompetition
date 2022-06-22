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

import * as chrome from "sinon-chrome";
global["chrome"] = chrome as any;
import { readFile } from "node:fs/promises";
import { Requester } from "../src/Requester";
import { PageParseService } from "../src/PageParserService";

let fileContent = "";
let requesterGetCalled = false;

Requester.get = async function (): Promise<string> {
  requesterGetCalled = true;
  return fileContent;
};

async function readFileData(): Promise<string> {
  return readFile("./tests/fakeData.txt").then((file) =>
    file.toString("utf-8")
  );
}

beforeAll(async () => {
  fileContent = await readFileData();
});

describe("Page parser service", () => {
  it("should call the get request method", () => {
    PageParseService.parse("whatever", ["french"]);
    expect(requesterGetCalled).toBe(true);
  });

  it("Should find 5 french competition in the fake data provided", async () => {
    const competitions = await PageParseService.parse("whatever", ["french"]);

    expect(competitions).toHaveLength(3);
    expect(competitions).toEqual([
      "/competition/5ccb66888b6e3",
      "/competition/5ccba7500997b",
      "/competition/5ccbbd4a76625",
    ]);
  });
});
