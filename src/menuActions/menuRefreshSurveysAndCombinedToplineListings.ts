import difference from "lodash/difference";
import intersection from "lodash/intersection";
import union from "lodash/union";
import {
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  combinedToplineSheetValueRowToToplineEntry,
  gsResultsFolderName,
  surveyEntryToSurveysSheetValueRow,
  surveysSheetHeaders,
  surveysSheetName,
  surveysSheetValueRowToSurveyEntry,
  toplineEntryToCombinedToplineSheetValueRow
} from "../gsheetsData/hardcodedConstants";
import {
  addGsheetConvertedVersionOfExcelFileToFolder,
  adjustSheetRowsAndColumnsCount,
  arrayOfASingleValue,
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  getColumnValuesRange,
  getSheetDataIncludingHeaderRow,
  gsheetMimeType,
  xlsxMimeType
} from "./common";
import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"
 *
 * Notes:
 * - Creates the `surveys` and `topline_combo` worksheets if they don't exist
 * - Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected
 */
export function menuRefreshSurveysAndCombinedToplineListings() {
  try {
    refreshSurveysAndCombinedToplineListings();
    SpreadsheetApp.getUi().alert(
      "Refreshed the surveys and combined topline listing (based on files in the gs_results folder)."
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
function refreshSurveysAndCombinedToplineListings() {
  /* tslint:disable:no-console */
  console.info(`Start of refreshSurveysAndCombinedToplineListings()`);

  console.info(`Fetching and verifying existing worksheet contents`);
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

  const surveysSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    surveysSheet,
    surveysSheetHeaders
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
    combinedToplineSheetHeaders,
    combinedToplineSheetName,
    combinedToplineSheetValuesIncludingHeaderRow
  );

  // Read files in the (first found) folder called "gs_results", ensuring that there is a Gsheet version of each uploaded Excel file
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
  refreshCombinedToplineSheetListing(
    updatedSurveysSheetValues,
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`End of refreshSurveysAndCombinedToplineListings()`);
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

/**
 * @hidden
 */
function refreshSurveysSheetListing(
  surveysSheet: Sheet,
  surveysSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  const surveysSheetValues = surveysSheetValuesIncludingHeaderRow.slice(1);

  // Update existing entries
  const existingSurveyEntries = surveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );
  const fileNamesEncounteredInExistingEntries = [];
  const updatedSurveyEntries = existingSurveyEntries.map(
    existingSurveyEntry => {
      if (existingSurveyEntry.file_name === "") {
        return existingSurveyEntry;
      }
      let link_if_found_in_gs_results_folder =
        "(Not found in gs_results folder)";
      const matchingGsResultsFolderGsheetFiles = gsResultsFolderGsheetFiles.filter(
        (gsResultsFolderGsheetFile: File) =>
          existingSurveyEntry.file_name === gsResultsFolderGsheetFile.getName()
      );
      if (matchingGsResultsFolderGsheetFiles.length > 0) {
        const matchingGsResultsFolderGsheetFile =
          matchingGsResultsFolderGsheetFiles[0];
        fileNamesEncounteredInExistingEntries.push(
          matchingGsResultsFolderGsheetFile.getName()
        );
        link_if_found_in_gs_results_folder = matchingGsResultsFolderGsheetFile.getUrl();
      }
      return {
        ...existingSurveyEntry,
        link_if_found_in_gs_results_folder
      };
    }
  );

  // Add previously unencountered gsheet files to the bottom of the surveys sheet listing
  const gsResultsFolderGsheetFileNames = gsResultsFolderGsheetFiles.map(
    gsResultsFolderGsheetFile => gsResultsFolderGsheetFile.getName()
  );
  const newGsResultsFolderGsheetFileNames = difference(
    gsResultsFolderGsheetFileNames,
    fileNamesEncounteredInExistingEntries
  );
  const newGsResultsFolderGsheetFiles = gsResultsFolderGsheetFiles.filter(
    (gsResultsFolderGsheetFile: File) =>
      newGsResultsFolderGsheetFileNames.includes(
        gsResultsFolderGsheetFile.getName()
      )
  );
  if (newGsResultsFolderGsheetFiles.length > 0) {
    newGsResultsFolderGsheetFiles.map((gsResultsFolderGsheetFile: File) => {
      updatedSurveyEntries.push({
        file_name: gsResultsFolderGsheetFile.getName(),
        link_if_found_in_gs_results_folder: gsResultsFolderGsheetFile.getUrl(),
        survey_name: ""
      });
    });
  }

  // Save the updated values to the surveys worksheet
  const updatedSurveysSheetValues = updatedSurveyEntries.map(
    surveyEntryToSurveysSheetValueRow
  );
  surveysSheet
    .getRange(
      2,
      1,
      updatedSurveysSheetValues.length,
      updatedSurveysSheetValues[0].length
    )
    .setValues(updatedSurveysSheetValues);

  // Limit the amount of rows of the surveys spreadsheet to the amount of surveys + a few extras for adding new ones
  const extraBlankRows = 3;
  adjustSheetRowsAndColumnsCount(
    surveysSheet,
    updatedSurveysSheetValues.length + extraBlankRows + 1,
    surveysSheetValuesIncludingHeaderRow[0].length
  );

  // Fill the "number_of_rows_in_topline_combo" column with a formula
  const catalogStatusRange = getColumnValuesRange(
    surveysSheet,
    surveysSheetHeaders,
    "number_of_rows_in_topline_combo"
  );
  const sheetValueRowsCount = surveysSheet.getMaxRows() - 1;
  const formulas = arrayOfASingleValue(
    '=IF(INDIRECT("R[0]C[-2]", FALSE)="","",COUNTIF(topline_combo!$A$2:$A, SUBSTITUTE(INDIRECT("R[0]C[-2]", FALSE),"survey-","")))',
    sheetValueRowsCount
  );
  const formulaRows = formulas.map(formula => [formula]);
  catalogStatusRange.setFormulas(formulaRows);

  return { updatedSurveysSheetValues };
}

/**
 * @hidden
 */
function fileNameToSurveyId(fileName) {
  return fileName.replace("survey-", "");
}

/**
 * @hidden
 */
function refreshCombinedToplineSheetListing(
  updatedSurveysSheetValues: any[][],
  combinedToplineSheet: Sheet,
  combinedToplineSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  /* tslint:disable:no-console */
  console.info(`Start of refreshCombinedToplineSheetListing()`);

  // Clear all rows except the header row
  console.info(`Clearing all rows except the header row`);
  combinedToplineSheet
    .getRange(
      2,
      1,
      combinedToplineSheetValuesIncludingHeaderRow.length,
      combinedToplineSheetValuesIncludingHeaderRow[0].length
    )
    .clearContent();

  // From the existing sheet contents, purge entries that does not have an entry in the surveys sheet
  // so that the combined topline listing only contains rows that are relevant for analysis
  console.info(`Purging orphaned rows from the combined topline listing`);
  const combinedToplineSheetValues = combinedToplineSheetValuesIncludingHeaderRow.slice(
    1
  );
  const existingSurveyEntries = updatedSurveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );
  const existingToplineEntries = combinedToplineSheetValues.map(
    combinedToplineSheetValueRowToToplineEntry
  );
  const existingSurveysSurveyIds = existingSurveyEntries.map(
    existingSurveyEntry => fileNameToSurveyId(existingSurveyEntry.file_name)
  );
  const existingToplineSurveyIds = union(
    existingToplineEntries.map(
      existingToplineEntry => existingToplineEntry.survey_id
    )
  );

  const surveyIdsInBothListings = intersection(
    existingSurveysSurveyIds,
    existingToplineSurveyIds
  );

  const toplineEntriesWithSurveyEntry = existingToplineEntries.filter(
    toplineEntry => surveyIdsInBothListings.includes(toplineEntry.survey_id)
  );

  // Write the purged/trimmed contents back to the sheet
  console.info(`Writing the purged/trimmed contents back to the sheet`);
  if (toplineEntriesWithSurveyEntry.length > 0) {
    combinedToplineSheet
      .getRange(
        2,
        1,
        toplineEntriesWithSurveyEntry.length,
        combinedToplineSheetValuesIncludingHeaderRow[0].length
      )
      .setValues(
        toplineEntriesWithSurveyEntry.map(
          toplineEntryToCombinedToplineSheetValueRow
        )
      );
  }
  let rowsWritten = toplineEntriesWithSurveyEntry.length;

  console.info(
    `Finding which gsheet files are not-yet-included in the combined topline listing`
  );
  const gsResultsFolderGsheetFilesSurveyIds = union(
    gsResultsFolderGsheetFiles.map(gsResultsFolderGsheetFile =>
      fileNameToSurveyId(gsResultsFolderGsheetFile.getName())
    )
  );
  const notYetIncludedGsResultsFolderGsheetFilesSurveyIds = difference(
    gsResultsFolderGsheetFilesSurveyIds,
    existingToplineSurveyIds
  );
  const notYetIncludedGsResultsFolderGsheetFiles = gsResultsFolderGsheetFiles.filter(
    (gsResultsFolderGsheetFile: File) => {
      const surveyId = fileNameToSurveyId(gsResultsFolderGsheetFile.getName());
      return notYetIncludedGsResultsFolderGsheetFilesSurveyIds.includes(
        surveyId
      );
    }
  );
  // Open each not-yet-included gsheet file and add rows to the end of the sheet continuously
  if (notYetIncludedGsResultsFolderGsheetFiles.length > 0) {
    console.info(
      `Opening the ${notYetIncludedGsResultsFolderGsheetFiles.length} not-yet-included gsheet file(s) and adding them to the end of the sheet`
    );
    // console.log({ notYetIncludedGsResultsFolderGsheetFiles });
    notYetIncludedGsResultsFolderGsheetFiles.map(
      (gsResultsFolderGsheetFile: File) => {
        const gsResultsFolderGsheet = SpreadsheetApp.openById(
          gsResultsFolderGsheetFile.getId()
        );
        const sourceSheet = gsResultsFolderGsheet.getSheetByName("Topline");
        const sourceDataRange = sourceSheet.getDataRange();
        const sourceValuesIncludingHeaderRow = sourceDataRange.getValues();
        const sourceHeaderRows = sourceValuesIncludingHeaderRow.slice(0, 1);
        const sourceValues = sourceValuesIncludingHeaderRow.slice(1);
        combinedToplineSheet
          .getRange(
            rowsWritten + 2,
            1,
            sourceValues.length,
            sourceHeaderRows[0].length
          )
          .setValues(sourceValues);
        rowsWritten += sourceValues.length;
      }
    );
  }

  // Read back the updated combined topline sheet data
  console.info(`Reading back the updated combined topline sheet data`);
  const updatedCombinedToplineSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedToplineSheet,
    combinedToplineSheetHeaders
  );

  // Limit the amount of rows of the surveys spreadsheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the surveys spreadsheet to the amount of entries`
  );
  const updatedCombinedToplineSheetData = updatedCombinedToplineSheetValuesIncludingHeaderRow.slice(
    1
  );
  adjustSheetRowsAndColumnsCount(
    combinedToplineSheet,
    updatedCombinedToplineSheetData.length + 1,
    updatedCombinedToplineSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`End of refreshCombinedToplineSheetListing()`);
  /* tslint:enable:no-console */
}
