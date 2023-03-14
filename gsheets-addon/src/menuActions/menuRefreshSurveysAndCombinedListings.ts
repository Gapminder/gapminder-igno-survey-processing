import { invokeGcpCloudFunction } from "../lib/invokeGcpCloudFunction";
import { mutex } from "../lib/mutex";

function refreshSurveysAndCombinedListingsCloudFunction(): string {
  /* tslint:disable:no-console */
  console.info(`Start of refreshSurveysAndCombinedListingsCloudFunction()`);

  const responseText = invokeGcpCloudFunction(
    "europe-west3",
    "igno-survey-process-scripts",
    "refresh_surveys_and_combined_listings"
  );

  console.info(`End of refreshSurveysAndCombinedListingsCloudFunction()`);
  return responseText;
  /* tslint:enable:no-console */
}

/**
 * Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"
 *
 * Notes:
 * - Creates the `surveys` and `topline_combo` worksheets if they don't exist
 * - Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected
 */
export function menuRefreshSurveysAndCombinedListings() {
  /* tslint:disable:no-console */
  try {
    // Ensure the script can not have multiple simultaneous executions
    const results = mutex<
      typeof refreshSurveysAndCombinedListingsCloudFunction,
      string
    >(
      "refreshSurveysAndCombinedListingsCloudFunction",
      refreshSurveysAndCombinedListingsCloudFunction,
      60 * 3
    );

    if (results) {
      SpreadsheetApp.getUi().alert(
        `Done running import data routine. Results:\n\n${results}`
      );
    } else {
      console.log(
        `The survey processing script got back to us without anything to report. Notifying user.`
      );
      SpreadsheetApp.getUi().alert(
        `The survey processing script got back to us without anything to report. This could be due to some hidden error. Try again and if it still doesn't work, contact the maintainer of the survey processing script.`
      );
      return;
    }
  } catch (e) {
    // Make sure that the error ends up in the logs, regardless of if the user sees the error or not
    console.error(e);

    // Inform about appropriate user action on timeout
    if (
      e.message.indexOf(
        "Service Spreadsheets timed out while accessing document"
      ) > -1
    ) {
      SpreadsheetApp.getUi().alert(
        "The script did not have time to finish all the imports before it timed out. Please re-run the script."
      );
      return;
    }

    // Ignore "Timed out waiting for user response" since it just means that we let the script run and went for coffee
    if (
      e instanceof Error &&
      e.message === "Timed out waiting for user response"
    ) {
      return;
    }

    // Friendly error notice
    const additionalInfo =
      e instanceof Error ? `: \n\n${e.message}\n\n${e.stack}` : ``;
    SpreadsheetApp.getUi().alert(`Encountered an issue${additionalInfo}`);

    // Also throw the error so that it is clear that there was an error
    throw e;
  }

  return;
  /* tslint:enable:no-console */
}
