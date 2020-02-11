import {
  gsDashboardSurveyListingsSheetHeaders,
  gsDashboardSurveyListingsSheetName
} from "../gsheetsData/hardcodedConstants";
import {
  ensuredColumnIndex,
  fetchAndVerifyGsDashboardSurveyListingsSheet,
  getColumnValuesRange
} from "./common";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * Menu item action for "Gapminder Igno Survey Process -> Extract Survey IDs from copy-pasted linked survey names"
 */
export function menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames() {
  try {
    extractSurveyIdsFromCopyPastedLinkedSurveyNames();
    SpreadsheetApp.getUi().alert(
      `Extracted Survey IDs from copy-pasted linked survey names (in the "${gsDashboardSurveyListingsSheetName}" worksheet)`
    );
  } catch (e) {
    // Make sure that the error ends up in the logs, regardless of if the user sees the error or not
    /* tslint:disable:no-console */
    console.error(e);
    /* tslint:enable:no-console */
    // Ignore "Timed out waiting for user response" since it just means that we let the script run and went for coffee
    if (e.message === "Timed out waiting for user response") {
      return;
    }
    // Friendly error notice
    SpreadsheetApp.getUi().alert(
      "Encountered an issue: \n\n" + e.message + "\n\n" + e.stack
    );
    // Also throw the error so that it is clear that there was an error
    throw e;
  }

  return;
}

/**
 * @hidden
 */
function extractSurveyIdsFromCopyPastedLinkedSurveyNames() {
  /* tslint:disable:no-console */
  console.info(`Start of extractSurveyIdsFromCopyPastedLinkedSurveyNames()`);

  console.info(`Fetching and verifying existing worksheets`);
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const {
    gsDashboardSurveyListingsSheet,
    gsDashboardSurveyListingsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyGsDashboardSurveyListingsSheet(activeSpreadsheet);

  console.info(`Refreshing GS Dashboard survey listing sheet`);
  refreshGsDashboardSurveyListingsSheetListing(
    gsDashboardSurveyListingsSheet,
    gsDashboardSurveyListingsSheetValuesIncludingHeaderRow,
    activeSpreadsheet
  );

  console.info(`End of extractSurveyIdsFromCopyPastedLinkedSurveyNames()`);
  /* tslint:enable:no-console */
}

/**
 * @hidden
 */
function refreshGsDashboardSurveyListingsSheetListing(
  gsDashboardSurveyListingsSheet: Sheet,
  gsDashboardSurveyListingsSheetValuesIncludingHeaderRow: string[][],
  activeSpreadsheet: Spreadsheet
) {
  const surveyNameColumnValuesRange = getColumnValuesRange(
    gsDashboardSurveyListingsSheet,
    gsDashboardSurveyListingsSheetHeaders,
    "Survey Name & Link"
  );

  const surveyNameColumnValuesRangeA1Notation = `${gsDashboardSurveyListingsSheetName}!${surveyNameColumnValuesRange.getA1Notation()}`;

  // @ts-ignore
  const advancedSheetsService = Sheets.Spreadsheets;

  const result = advancedSheetsService.get(activeSpreadsheet.getId(), {
    fields: "sheets.data.rowData.values.hyperlink",
    ranges: surveyNameColumnValuesRangeA1Notation
  });
  // console.log({ result });
  const embeddedHyperlinks = result.sheets[0].data[0].rowData.map(row =>
    row.values ? row.values[0].hyperlink : undefined
  );
  // console.log({ embeddedHyperlinks });

  // Fill URL column
  const urlColumnIndex = ensuredColumnIndex(
    gsDashboardSurveyListingsSheetHeaders,
    "URL"
  );
  const correspondingUrlColumnValuesRange = gsDashboardSurveyListingsSheet.getRange(
    2,
    urlColumnIndex + 1,
    embeddedHyperlinks.length,
    1
  );
  const existingUrlColumnValues = correspondingUrlColumnValuesRange.getDisplayValues();
  const urls = embeddedHyperlinks.map((embeddedHyperlink, index) =>
    embeddedHyperlink === undefined
      ? existingUrlColumnValues[index][0]
      : embeddedHyperlink
  );
  const newUrlColumnValues = urls.map(url => [url]);
  correspondingUrlColumnValuesRange.setValues(newUrlColumnValues);

  // Fill Survey ID column
  const surveyIdColumnIndex = ensuredColumnIndex(
    gsDashboardSurveyListingsSheetHeaders,
    "Survey ID"
  );
  const correspondingSurveyIdColumnValuesRange = gsDashboardSurveyListingsSheet.getRange(
    2,
    surveyIdColumnIndex + 1,
    newUrlColumnValues.length,
    1
  );
  const surveyIdValues = urls.map(url => [
    url.replace("https://surveys.google.com/reporting/survey?survey=", "")
  ]);
  correspondingSurveyIdColumnValuesRange.setValues(surveyIdValues);
}
