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
  /* tslint:disable:no-console */
  // Gets a cache that is specific to the current document containing the script
  const cache = CacheService.getDocumentCache();

  const cached = cache.get("script-is-running");
  console.log({ cached });
  if (cached !== null) {
    console.log("Script is already running");
    SpreadsheetApp.getUi().alert(
      `Script is already running. Please wait for it to finish (max 10 minutes) and try again`
    );
    return;
  }
  cache.put("script-is-running", "true", 60 * 10); // cache for 10 minutes

  // Long running script
  try {
    refreshSurveysAndCombinedListings();

    // Removes any cache entries for 'script-is-running'
    cache.remove("script-is-running");
    console.log("Removed cache entry. The script can run again now");

    SpreadsheetApp.getUi().alert(
      "Refreshed the surveys and combined listings (based on files in the gs_results folder)."
    );
  } catch (e) {
    // Make sure that the error ends up in the logs, regardless of if the user sees the error or not
    console.error(e);

    // Removes any cache entries for 'script-is-running'
    cache.remove("script-is-running");
    console.log("Removed cache entry. The script can run again now");

    // Inform about appropriate user action on timeout
    if (
      e.message.indexOf(
        "Service Spreadsheets timed out while accessing document"
      )
    ) {
      SpreadsheetApp.getUi().alert(
        "The script did not have time to finish all the imports before it timed out. Please re-run the script."
      );
      return;
    }

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
  /* tslint:enable:no-console */
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

  console.info(`Refreshing combined topline listing`);
  const { updatedCombinedToplineEntries } = refreshCombinedToplineSheetListing(
    updatedSurveysSheetValues,
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`Refreshing combined questions listing`);
  refreshCombinedQuestionsSheetListing(
    updatedSurveysSheetValues,
    updatedCombinedToplineEntries,
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`End of refreshSurveysAndCombinedListings()`);
  /* tslint:enable:no-console */
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
    // Remove/move duplicate gsheet files if they are encountered
    if (existingGsheetFiles.length > 1) {
      console.info(
        `Found ${existingGsheetFiles.length} Gsheet versions of the ${targetFileName} Excel file, removing all but one...`
      );
      existingGsheetFiles.slice(1).map((existingGsheetFileDuplicate: File) => {
        try {
          existingGsheetFileDuplicate.setTrashed(true);
        } catch (e) {
          console.log(
            `Error while trying to remove file with id ${existingGsheetFileDuplicate.getId()}`,
            e
          );
          // Move file instead
          console.log(`Moving file to the "Moved Duplicates" folder instead`);
          const movedDuplicatesFolder = gsResultsFolder
            .getFoldersByName("Moved Duplicates")
            .next();
          movedDuplicatesFolder.addFile(existingGsheetFileDuplicate);
          existingGsheetFileDuplicate
            .getParents()
            .next()
            .removeFile(existingGsheetFileDuplicate);
        }
      });
    }
  });
  return filesByMimeType;
}
