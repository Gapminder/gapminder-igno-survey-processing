import {
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import {
  adjustSheetRowsAndColumnsCount,
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  getSheetDataIncludingHeaderRow
} from "./common";

/**
 * Menu item action for "Gapminder Igno Survey Process -> Refresh combined topline listing"
 *
 * Notes:
 * - Creates the `surveys` and `topline_combo` worksheets if they don't exist
 * - Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected
 */
export function menuRefreshCombinedToplineListing() {
  refreshCombinedToplineListing();

  SpreadsheetApp.getUi().alert(
    "Refreshed the combined topline listing (based on files in the gs_results folder)."
  );

  return;
}

/**
 * @hidden
 */
function refreshCombinedToplineListing() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let surveysSheet = activeSpreadsheet.getSheetByName(surveysSheetName);
  if (surveysSheet === null) {
    surveysSheet = createSheet(
      activeSpreadsheet,
      surveysSheetName,
      surveysSheetHeaders
    );
  }

  let combinedToplineSheet = activeSpreadsheet.getSheetByName(
    combinedToplineSheetName
  );
  if (combinedToplineSheet === null) {
    combinedToplineSheet = createSheet(
      activeSpreadsheet,
      combinedToplineSheetName,
      combinedToplineSheetHeaders
    );
  }

  const surveysSheetDataIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    surveysSheet,
    surveysSheetHeaders
  );

  const combinedToplineSheetDataIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedToplineSheet,
    combinedToplineSheetHeaders
  );

  // Verify that the first headers are as expected
  if (
    !assertCorrectLeftmostSheetColumnHeaders(
      surveysSheetHeaders,
      surveysSheetName,
      surveysSheetDataIncludingHeaderRow
    )
  ) {
    return;
  }
  if (
    !assertCorrectLeftmostSheetColumnHeaders(
      combinedToplineSheetHeaders,
      combinedToplineSheetName,
      combinedToplineSheetDataIncludingHeaderRow
    )
  ) {
    return;
  }

  // Read files in the gs_results folder
  // TODO
  const combinedToplineSheetData = [];

  refreshCombinedToplineListingSheet(
    combinedToplineSheet,
    combinedToplineSheetData
  );

  // Read back the updated combined topline sheet data
  const updatedCombinedToplineSheetDataIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedToplineSheet,
    combinedToplineSheetHeaders
  );

  // Limit the amount of rows of the surveys spreadsheet to the amount of surveys + a few extras for adding new ones
  const surveysSheetData = surveysSheetDataIncludingHeaderRow.slice(1);
  adjustSheetRowsAndColumnsCount(
    surveysSheet,
    surveysSheetData.length + 1 + 3,
    surveysSheetDataIncludingHeaderRow[0].length
  );

  // Limit the amount of rows of the surveys spreadsheet to the amount of entries
  const updatedCombinedToplineSheetData = updatedCombinedToplineSheetDataIncludingHeaderRow.slice(
    1
  );
  adjustSheetRowsAndColumnsCount(
    combinedToplineSheet,
    updatedCombinedToplineSheetData.length + 1,
    updatedCombinedToplineSheetDataIncludingHeaderRow[0].length
  );
}

/**
 * @hidden
 */
function refreshCombinedToplineListingSheet(
  sheet,
  gsResultsFolderListing: any[]
) {
  const gsResultsFolderListingValues = gsResultsFolderListing
    .map((row: any) => {
      return [row, row, row];
    })
    .reduce((a, b) => a.concat(b), []); // flattens the result
  const combinedToplineValues = [combinedToplineSheetHeaders].concat(
    gsResultsFolderListingValues
  );
  sheet
    .getRange(
      1,
      1,
      combinedToplineValues.length,
      combinedToplineSheetHeaders.length
    )
    .setValues(combinedToplineValues);
}
