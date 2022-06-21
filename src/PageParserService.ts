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

import { availableLang } from "./languages";
import { Requester } from "./Requester";
import { parseJsArray } from "./common";
import { Element as CheerioElement, Cheerio, load } from "cheerio";

const clearRegexes = [
  new RegExp("<script[^>]*>(.|\\s)*?<\\/script>", "g"), //rm script tags
  new RegExp("url\\(['\"][\\d\\D]*?.png['\"]\\)", "g"), //rm url attributes in images
  new RegExp(
    "<[a-z]*.*?style=['\"].*?url\\(.*?\\).*?['\"].*?>.*?<\\/[a-z]*>",
    "ig"
  ), //rm anchors
  new RegExp("<link[^>]*?>", "g"), //rm links
  new RegExp("<img[^>]*?\\/?>", "g"), // rm images
];

const competListRegex =
  /\s*var\s+competitions_participated\s*=\s*\[(\"\d+\",)*(\"\d+\")?\];/;

interface CompetitionData {
  id: number;
  url: string;
}

export class PageParseService {
  /**
   * Only public accessor for the parser service, only works
   * when the user is connected, returns the list of URLS of the competitions
   * to be done yet
   */
  public static async parse(
    pageUrl: string,
    langs: string[]
  ): Promise<string[]> {
    return await new PageParseService(pageUrl).getMyCompetitions(langs);
  }

  /**
   * Constructor with the url of the page to parse
   */
  constructor(private readonly pageUrl: string) {}

  /**
   * Parser the competition page to check if new competitions were
   * created
   *
   * @param langs list of languages the user want to compet in
   * @returns all the competitions to be completed by the user
   */
  private async getMyCompetitions(langs: string[]): Promise<string[]> {
    const page = await Requester.get(this.pageUrl);
    const doneCompetitions = this.getCompetitionsParticipated(page);
    const cleanedPage = this.cleanHtml(page);
    const flagIds = langs.map((x) => availableLang[x].flagId);
    const compets = this.readPageCompetitions(cleanedPage, flagIds);
    return compets
      .filter((x) => doneCompetitions.indexOf(x.id) == -1)
      .map((x) => x.url);
  }

  /**
   *
   * @param cleanHtml html without any external links, to parse to find any competitions
   * @param flagIds ids of the flags we're looking for
   * @returns List of all the competitions found
   */
  private readPageCompetitions(
    cleanHtml: string,
    flagIds: number[]
  ): CompetitionData[] {
    const $ = load(cleanHtml);
    const rows = $("#join-competition-table tbody").first().find("tr");
    const transform = this.hasGreenStamp(flagIds);

    return rows
      .map(transform)
      .toArray()
      .filter((x) => x !== null);
  }

  /**
   *
   * @param flagIds all the flag we're looking for
   * @returns A function to turn a row into a competition data (null if it does not have the flag in the list)
   */
  private hasGreenStamp(
    flagIds: number[]
  ): (
    this: CheerioElement,
    i: number,
    el: CheerioElement
  ) => CompetitionData | null {
    return (_idx, el: CheerioElement): CompetitionData | null => {
      const $td = load(el)("td");
      const flagSpan = $td.find("span:first-child").attr("id");
      const flag = +(flagSpan?.replace("flagid", "") ?? "0");
      const timeLeft = $td.last().text() ?? ""; // If seconds remains, not possible to join the competition
      if (timeLeft.endsWith("s") || flagIds.indexOf(flag) === -1) return null;
      const competId = $td
        .find(":nth-child(3) div")
        .first()
        .attr("competition_id");
      //Compet not done yet
      return {
        id: +(competId ?? 0),
        url: $td.find(":nth-child(2) a").first().attr("href") ?? "",
      };
    };
  }

  /**
   * Remove all the urls/calls of the get request
   * @param  html The full html document
   * @return The cleaned html
   */
  private cleanHtml(html: string): string {
    return clearRegexes.reduce((str, a) => str.replace(a, ""), html);
  }

  /**
   *
   * @param html parses the ids of the competitions the user participated in
   * @returns the list of the competitions ids
   */
  private getCompetitionsParticipated(html: string): number[] {
    const res = competListRegex.exec(html);
    if (res && res[0]) {
      return parseJsArray(res[0]);
    } else {
      return [];
    }
  }
}
