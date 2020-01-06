import {
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  gsResultsFolderName,
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import {
  addGsheetConvertedVersionOfExcelFileToFolder,
  adjustSheetRowsAndColumnsCount,
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  getSheetDataIncludingHeaderRow,
  gsheetMimeType,
  xlsxMimeType
} from "./common";
import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;

/**
 * Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"
 *
 * Notes:
 * - Creates the `surveys` and `topline_combo` worksheets if they don't exist
 * - Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected
 */
export function menuRefreshSurveysAndCombinedToplineListings() {
  refreshCombinedToplineListing();

  SpreadsheetApp.getUi().alert(
    "Refreshed the surveys and combined topline listings (based on files in the gs_results folder)."
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
  const folders = DriveApp.getFoldersByName(gsResultsFolderName);
  if (!folders.hasNext()) {
    throw Error(`No folder found called "${gsResultsFolderName}"`);
  }

  // Use the first matching folder
  const gsResultsFolder = folders.next();

  // Load files, ensuring that there is a Gsheet version of each uploaded Excel file
  const filesByMimeType = ensureGsheetVersionsOfEachExcelFile(gsResultsFolder);

  console.log(filesByMimeType);

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
function ensureGsheetVersionsOfEachExcelFile(gsResultsFolder: Folder) {
  const gsResultsFolderFiles = gsResultsFolder.getFiles();
  const filesByMimeType = {};
  filesByMimeType[xlsxMimeType] = [];
  filesByMimeType[gsheetMimeType] = [];
  while (gsResultsFolderFiles.hasNext()) {
    const file = gsResultsFolderFiles.next();
    if (!filesByMimeType[file.getMimeType()]) {
      filesByMimeType[file.getMimeType()] = [];
    }
    filesByMimeType[file.getMimeType()].push(file);
  }
  filesByMimeType[xlsxMimeType].map(excelFile => {
    const targetFileName = excelFile.getName().replace(/.xlsx?/, "");
    const existingGsheetFiles = filesByMimeType[gsheetMimeType].filter(
      (gsheetFile: File) => gsheetFile.getName() === targetFileName
    );
    if (existingGsheetFiles.length === 0) {
      /* tslint:disable:no-console */
      console.info(
        `Found no Gsheet version of the ${targetFileName} Excel file, creating...`
      );
      const gsheetFile = addGsheetConvertedVersionOfExcelFileToFolder(
        excelFile,
        gsResultsFolder,
        targetFileName
      );
      console.info(
        `Created Gsheet version of the ${targetFileName} Excel file`
      );
      /* tslint:enable:no-console */
      filesByMimeType[gsheetMimeType].push(gsheetFile);
    }
  });
  return filesByMimeType;
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
