import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

export class UrlFetchAppFetchException extends Error {
  public name: string;

  public url: string;

  public response: HTTPResponse;

  constructor(url?: string, response?: HTTPResponse) {
    const responseCode = response.getResponseCode();
    const message = `Request failed for "${url}". Returned code: ${responseCode}.`;
    super(message);
    this.name = "UrlFetchAppFetchException";
    this.url = url;
    this.response = response;
  }
}

/**
 * To get exceptions thrown when requests fail
 */
export const errorHandlingFetch = (
  url: string,
  params?: URLFetchRequestOptions
): HTTPResponse => {
  const response = UrlFetchApp.fetch(url, {
    ...(params || {}),
    muteHttpExceptions: true
  });
  const responseCode = response.getResponseCode();
  if (
    responseCode !== 200 &&
    !(responseCode === 302 && params.followRedirects)
  ) {
    throw new UrlFetchAppFetchException(url, response);
  }
  return response;
};
