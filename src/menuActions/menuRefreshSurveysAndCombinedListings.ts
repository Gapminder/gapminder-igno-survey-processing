import {
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetName,
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  gsResultsFolderName,
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import {
  addGsheetConvertedVersionOfExcelFileToFolder,
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  getSheetDataIncludingHeaderRow,
  gsheetMimeType,
  xlsxMimeType
} from "./common";
import { refreshCombinedQuestionsSheetListing } from "./refreshCombinedQuestionsSheetListing";
import { refreshCombinedToplineSheetListing } from "./refreshCombinedToplineSheetListing";
import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import { refreshSurveysSheetListing } from "./refreshSurveysSheetListing";

/**
 * Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"
 *
 * Notes:
 * - Creates the `surveys` and `topline_combo` worksheets if they don't exist
 * - Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected
 */
export function menuRefreshSurveysAndCombinedListings() {
  try {
    refreshSurveysAndCombinedListings();
    SpreadsheetApp.getUi().alert(
      "Refreshed the surveys and combined listings (based on files in the gs_results folder)."
    );
  } catch (e) {
    // Ignore "Timed out waiting for user response" since it just means that we let the script run and went for coffee
    if (e.message === "Timed out waiting for user response") {
      return;
    }
    // Friendly error notice
    SpreadsheetApp.getUi().alert(
      "Encountered an issue: \n\n" + e.message + "\n\n" + e.stack
    );
    // Also throw the error so that it turns up in the error log
    throw e;
  }

  return;
}

/**
 * @hidden
 */
function refreshSurveysAndCombinedListings() {
  /* tslint:disable:no-console */
  console.info(`Start of refreshSurveysAndCombinedListings()`);

  console.info(`Fetching and verifying existing worksheets`);
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let surveysSheet = activeSpreadsheet.getSheetByName(surveysSheetName);
  if (surveysSheet === null) {
    surveysSheet = createSheet(
      activeSpreadsheet,
      surveysSheetName,
      surveysSheetHeaders
    );
  }

  let combinedQuestionsSheet = activeSpreadsheet.getSheetByName(
    combinedQuestionsSheetName
  );
  if (combinedQuestionsSheet === null) {
    combinedQuestionsSheet = createSheet(
      activeSpreadsheet,
      combinedQuestionsSheetName,
      combinedQuestionsSheetHeaders
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

  const surveysSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    surveysSheet,
    surveysSheetHeaders
  );

  const combinedQuestionsSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders
  );

  const combinedToplineSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedToplineSheet,
    combinedToplineSheetHeaders
  );

  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    surveysSheetHeaders,
    surveysSheetName,
    surveysSheetValuesIncludingHeaderRow
  );
  assertCorrectLeftmostSheetColumnHeaders(
    combinedQuestionsSheetHeaders,
    combinedQuestionsSheetName,
    combinedQuestionsSheetValuesIncludingHeaderRow
  );
  assertCorrectLeftmostSheetColumnHeaders(
    combinedToplineSheetHeaders,
    combinedToplineSheetName,
    combinedToplineSheetValuesIncludingHeaderRow
  );

  // Read files in the folder called "gs_results" (the first found, in case there are many),
  // ensuring that there is a Gsheet version of each uploaded Excel file
  console.info(
    `Reading files in the folder called "gs_results", ensuring that there is a Gsheet version of each uploaded Excel file`
  );
  const folders = DriveApp.getFoldersByName(gsResultsFolderName);
  if (!folders.hasNext()) {
    throw Error(`No folder found called "${gsResultsFolderName}"`);
  }
  const gsResultsFolder = folders.next();
  const filesByMimeType = ensureGsheetVersionsOfEachExcelFile(gsResultsFolder);
  const gsResultsFolderGsheetFiles = filesByMimeType[gsheetMimeType];

  console.info(`Refreshing survey listing`);
  const { updatedSurveysSheetValues } = refreshSurveysSheetListing(
    surveysSheet,
    surveysSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`Refreshing combined questions listing`);
  refreshCombinedQuestionsSheetListing(
    updatedSurveysSheetValues,
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`Refreshing combined topline listing`);
  refreshCombinedToplineSheetListing(
    updatedSurveysSheetValues,
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`End of refreshSurveysAndCombinedListings()`);
  /* tslint:disable:no-console */
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
    // Note: Trimming at the end to ensure that the converted file name does not start or end with spaces
    const targetFileName = excelFile
      .getName()
      .replace(/.xlsx?/, "")
      .trim();
    const existingGsheetFiles = filesByMimeType[gsheetMimeType].filter(
      (gsheetFile: File) => gsheetFile.getName().trim() === targetFileName
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
