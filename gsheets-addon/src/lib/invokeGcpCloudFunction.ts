import { errorHandlingFetch } from "./errorHandlingFetch";

export function invokeGcpCloudFunction(
  gcpRegion: string,
  gcpProject: string,
  cloudFunction: string
): string {
  // Used to be able to invoke the GCP cloud function
  const idToken = ScriptApp.getIdentityToken();

  // Used by the GCP cloud function to modify the current spreadsheet
  const accessToken = ScriptApp.getOAuthToken();
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();

  const payload = JSON.stringify({
    accessToken,
    spreadsheetId
  });
  const response = errorHandlingFetch(
    `https://${gcpRegion}-${gcpProject}.cloudfunctions.net/${cloudFunction}`,
    {
      contentType: "application/json",
      followRedirects: false,
      headers: {
        Authorization: `Bearer ${idToken}`
      },
      method: "post",
      payload
    }
  );

  /* tslint:disable:no-console */
  console.info(
    `Request finished. Response code: ${response.getResponseCode()}, Response: `,
    JSON.stringify({ response }, null, 2)
  );
  /* tslint:enable:no-console */

  return response.getContentText();
}
