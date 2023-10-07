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

import * as chrome from "sinon-chrome";
global["chrome"] = chrome as any;
import {
  join,
  is10fastFingersUrl,
  parseJsArray,
  extractCompetitionUrl,
} from "../src/common";

describe("Common methods", () => {
  it("Should join elements togeter", () => {
    const simpleJoin = join("a", "b");
    expect(simpleJoin).toEqual("a/b");

    const moreJoins = join("x", "mostElement", "", "j");
    expect(moreJoins).toEqual("x/mostElement//j");
  });

  it("Should be able to detect a valid 10fastfingers url", () => {
    const validUrl = "https://10fastfingers.com";

    const valids = [validUrl, validUrl + "/randomStuff", validUrl + "/"];

    const invalids = [
      `a${validUrl}`,
      `${validUrl}c`,
      `http://google.fr`,
      "http://10fastfingers.com",
    ];

    valids.forEach((v) => expect(is10fastFingersUrl(v)).toBe(true));
    invalids.forEach((iv) => expect(is10fastFingersUrl(iv)).toBe(false));
  });

  it("Should correctly parse a js array", () => {
    const testValues = [
      "[]",
      '["1"]',
      '["2"]',
      '["1", "123", "2", "3"]',
      '["23", "45", "1", "1"]',
      '["384443","384417"]',
      "['384443', '384417', '384417', '384417', '384417']",
    ];

    testValues.forEach((v) => {
      const values = eval(v).map((x: string) => +x);
      expect(parseJsArray(v)).toEqual(values);
    });
  });

  it("Should correctly extract the competition url from a more complex string", () => {
    const validTests = [
      [
        'Start: <a href="https://10fastfingers.com/competition/633ea8bf6d3a8">https://10fastfingers.com/competition/633ea8bf6d3a8</a>',
        "https://10fastfingers.com/competition/633ea8bf6d3a8",
      ],
      [
        'Start: <a href="https://10fastfingers.com/competition/aaaaaaaaaaaaa">https://10fastfingers.com/competition/aaaaaaaaaaaaa</a>',
        "https://10fastfingers.com/competition/aaaaaaaaaaaaa",
      ],
      [
        '<a href="https://10fastfingers.com/competition/123123123123123">https://10fastfingers.com/competition/123123123123123</a>',
        "https://10fastfingers.com/competition/123123123123123",
      ],
      [
        '<a href="https://10fastfingers.com/competition/bbbbbbbbbbbbb">',
        "https://10fastfingers.com/competition/bbbbbbbbbbbbb",
      ],
    ];

    validTests.forEach(([test, result]) => {
      expect(extractCompetitionUrl(test)).toEqual(result);
    });

    const invalidValues = [
      "",
      "Start: ",
      'Start: <a href="https://10fastfingers.com/page/633ea8bf6d3a8">https://10fastfingers.com/page/633ea8bf6d3a8</a>',
      '<a href="https://test.com/page/633ea8bf6d3a8">https://test.com/page/633ea8bf6d3a8</a>',
      '<a href="http://10fastfingers.com/page/633ea8bf6d3a8">http://10fastfingers.com/page/633ea8bf6d3a8</a>',
      "https://10fastfinger.com/page/633ea8bf6d3a8</a>",
      "https://10fastfinger.com/633ea8bf6d3a8",
      "https://10fastfinger.com/competitions/633ea8bf6d3a8",
    ];

    invalidValues.forEach((test) => {
      expect(extractCompetitionUrl(test)).toBeNull();
    });
  });
});
