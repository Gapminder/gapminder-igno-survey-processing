import difference from "lodash/difference";
import intersection from "lodash/intersection";
import union from "lodash/union";
import {
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetName,
  combinedQuestionsSheetValueRowToQuestionEntry,
  combinedToplineEntryToCombinedToplineSheetValueRow,
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  combinedToplineSheetValueRowToToplineEntry,
  gsResultsFolderName,
  overviewEntryToCombinedQuestionSheetValueRow,
  overviewSheetValueRowToOverviewEntry,
  questionEntryToCombinedQuestionsSheetValueRow,
  surveyEntryToSurveysSheetValueRow,
  surveysSheetHeaders,
  surveysSheetName,
  surveysSheetValueRowToSurveyEntry,
  toplineEntryToCombinedToplineSheetValueRow,
  toplineSheetValueRowToToplineEntry
} from "../gsheetsData/hardcodedConstants";
import {
  addGsheetConvertedVersionOfExcelFileToFolder,
  adjustSheetRowsAndColumnsCount,
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  fillColumnWithFormula,
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
        country: "",
        file_name: gsResultsFolderGsheetFile.getName(),
        input_sheet: "",
        link_if_found_in_gs_results_folder: gsResultsFolderGsheetFile.getUrl(),
        sample_size: "",
        survey_batch_id: "",
        survey_date: "",
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

  // Limit the amount of rows of the surveys spreadsheet to the amount of surveys
  /* tslint:disable:no-console */
  console.info(
    `Limiting the amount of rows of the surveys spreadsheet to the amount of surveys`
  );
  const extraBlankRows = 0;
  adjustSheetRowsAndColumnsCount(
    surveysSheet,
    updatedSurveysSheetValues.length + extraBlankRows + 1,
    surveysSheetValuesIncludingHeaderRow[0].length
  );

  const surveysSheetValueRowsCount = updatedSurveysSheetValues.length;

  console.info(`Filling formula columns`);
  /* tslint:enable:no-console */
  fillColumnWithFormula(
    surveysSheet,
    surveysSheetHeaders,
    "Survey Name",
    `=VLOOKUP(SUBSTITUTE(INDIRECT("R[0]C[6]", FALSE),"survey-",""),gs_dashboard_surveys_listing!$A$2:$G,2,FALSE)`,
    surveysSheetValueRowsCount
  );

  fillColumnWithFormula(
    surveysSheet,
    surveysSheetHeaders,
    "Sample Size",
    `=VLOOKUP(SUBSTITUTE(INDIRECT("R[0]C[2]", FALSE),"survey-",""),gs_dashboard_surveys_listing!$A$2:$G,3,FALSE)`,
    surveysSheetValueRowsCount
  );

  fillColumnWithFormula(
    surveysSheet,
    surveysSheetHeaders,
    "Survey Date",
    `=VLOOKUP(SUBSTITUTE(INDIRECT("R[0]C[1]", FALSE),"survey-",""),gs_dashboard_surveys_listing!$A$2:$G,4,FALSE)`,
    surveysSheetValueRowsCount
  );

  fillColumnWithFormula(
    surveysSheet,
    surveysSheetHeaders,
    "Number of rows in questions_combo",
    `=IF(INDIRECT("R[0]C[-2]", FALSE)="","",COUNTIF(${combinedQuestionsSheetName}!$A$2:$A, SUBSTITUTE(INDIRECT("R[0]C[-2]", FALSE),"survey-","")))`,
    surveysSheetValueRowsCount
  );

  fillColumnWithFormula(
    surveysSheet,
    surveysSheetHeaders,
    "Number of rows in topline_combo",
    `=IF(INDIRECT("R[0]C[-3]", FALSE)="","",COUNTIF(${combinedToplineSheetName}!$A$2:$A, SUBSTITUTE(INDIRECT("R[0]C[-3]", FALSE),"survey-","")))`,
    surveysSheetValueRowsCount
  );

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
function refreshCombinedQuestionsSheetListing(
  updatedSurveysSheetValues: any[][],
  combinedQuestionsSheet: Sheet,
  combinedQuestionsSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  /* tslint:disable:no-console */
  console.info(`Start of refreshCombinedQuestionsSheetListing()`);

  // From the existing sheet contents, purge entries that does not have an entry in the surveys sheet
  // so that the combined question listing only contains rows that are relevant for analysis
  console.info(`Purging orphaned rows from the combined question listing`);
  const combinedQuestionsSheetValues = combinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const existingSurveyEntries = updatedSurveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );
  const existingQuestionEntries = combinedQuestionsSheetValues.map(
    combinedQuestionsSheetValueRowToQuestionEntry
  );
  const existingSurveysSurveyIds = existingSurveyEntries.map(
    existingSurveyEntry => fileNameToSurveyId(existingSurveyEntry.file_name)
  );
  const existingQuestionSurveyIds = union(
    existingQuestionEntries.map(
      existingQuestionEntry => existingQuestionEntry.survey_id
    )
  );

  const surveyIdsInBothListings = intersection(
    existingSurveysSurveyIds,
    existingQuestionSurveyIds
  );

  const questionEntriesWithSurveyEntry = existingQuestionEntries.filter(
    questionEntry => surveyIdsInBothListings.includes(questionEntry.survey_id)
  );

  // Write the purged/trimmed contents back to the sheet
  console.info(`Writing the purged/trimmed contents back to the sheet`);
  if (questionEntriesWithSurveyEntry.length > 0) {
    // If we ended up with less rows than what already exists, clear all rows except the header row
    // so that we do not keep old rows hanging around
    if (
      questionEntriesWithSurveyEntry.length <
      combinedQuestionsSheetValues.length
    ) {
      // Clear all rows except the header row
      console.info(`Clearing all rows except the header row`);
      combinedQuestionsSheet
        .getRange(
          2,
          1,
          combinedQuestionsSheetValuesIncludingHeaderRow.length,
          combinedQuestionsSheetValuesIncludingHeaderRow[0].length
        )
        .clearContent();
    }

    combinedQuestionsSheet
      .getRange(
        2,
        1,
        questionEntriesWithSurveyEntry.length,
        combinedQuestionsSheetValuesIncludingHeaderRow[0].length
      )
      .setValues(
        questionEntriesWithSurveyEntry.map(
          questionEntryToCombinedQuestionsSheetValueRow
        )
      );
  }
  let rowsWritten = questionEntriesWithSurveyEntry.length;

  console.info(
    `Finding which gsheet files are not-yet-included in the combined question listing`
  );
  const gsResultsFolderGsheetFilesSurveyIds = union(
    gsResultsFolderGsheetFiles.map(gsResultsFolderGsheetFile =>
      fileNameToSurveyId(gsResultsFolderGsheetFile.getName())
    )
  );
  const notYetIncludedGsResultsFolderGsheetFilesSurveyIds = difference(
    gsResultsFolderGsheetFilesSurveyIds,
    existingQuestionSurveyIds
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
        const sourceSheet = gsResultsFolderGsheet.getSheetByName("Overview");
        const sourceDataRange = sourceSheet.getDataRange();
        const sourceValuesIncludingHeaderRow = sourceDataRange.getValues();

        // console.log({ notYetIncludedGsResultsFolderGsheetFiles });

        const sourceHeaderRows = sourceValuesIncludingHeaderRow.slice(0, 1);
        const sourceValues = sourceValuesIncludingHeaderRow.slice(1);
        const targetValues = sourceValues
          .map(overviewSheetValueRowToOverviewEntry)
          .map(overviewEntryToCombinedQuestionSheetValueRow);
        combinedQuestionsSheet
          .getRange(
            rowsWritten + 2,
            1,
            sourceValues.length,
            combinedQuestionsSheetHeaders.length
          )
          .setValues(targetValues);
        rowsWritten += sourceValues.length;
      }
    );
  }

  // Read back the updated combined question sheet data
  console.info(`Reading back the updated combined question sheet data`);
  const updatedCombinedQuestionsSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders
  );

  // Limit the amount of rows of the worksheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the combined questions worksheet to the amount of entries`
  );
  const updatedCombinedQuestionsSheetData = updatedCombinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  adjustSheetRowsAndColumnsCount(
    combinedQuestionsSheet,
    updatedCombinedQuestionsSheetData.length + 1,
    updatedCombinedQuestionsSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&INDIRECT("R[0]C[-1]", FALSE),{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(INDIRECT("R[0]C[-2]", FALSE),imported_igno_questions_info!$A$2:$C,2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question",
    `=VLOOKUP(INDIRECT("R[0]C[-2]", FALSE),imported_igno_questions_info!$B$2:$D,2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "The answer options",
    `=JOIN(" - ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]))`,
    // `=JOIN(" - ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = INDIRECT("R[0]C[-9]", FALSE),topline_combo!$C$2:$C = INDIRECT("R[0]C[-7]", FALSE)))`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answers by percent",
    `=JOIN(" - ",ARRAYFORMULA(TEXT(FILTER(topline_combo!$G$2:$G,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]), "0.0%")))`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct answer(s)",
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = "x"))`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered correctly",
    `=SUMIFS(topline_combo!$G$2:$G,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,"X")`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Overall Summary",
    `=IFERROR("Response count: "&I[ROW]&"
The answer options: "&J[ROW]&"
Answers by percent: "&K[ROW]&"
Correct answer(s): "&L[ROW]&"
% that answered correctly: "&TEXT(M[ROW], "0.0%"), "Results not processed yet")`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Amount of answer options",
    `=COUNTIFS(topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW])`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormula(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that would have answered correctly in an abc-type question",
    `=M[ROW]*O[ROW]/3`,
    updatedCombinedQuestionsSheetData.length
  );

  console.info(`End of refreshCombinedQuestionsSheetListing()`);
  /* tslint:enable:no-console */
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
    // If we ended up with less rows than what already exists, clear all rows except the header row
    // so that we do not keep old rows hanging around
    if (
      toplineEntriesWithSurveyEntry.length < combinedToplineSheetValues.length
    ) {
      console.info(`Clearing all rows except the header row`);
      combinedToplineSheet
        .getRange(
          2,
          1,
          combinedToplineSheetValuesIncludingHeaderRow.length,
          combinedToplineSheetValuesIncludingHeaderRow[0].length
        )
        .clearContent();
    }

    combinedToplineSheet
      .getRange(
        2,
        1,
        toplineEntriesWithSurveyEntry.length,
        combinedToplineSheetValuesIncludingHeaderRow[0].length
      )
      .setValues(
        toplineEntriesWithSurveyEntry.map(
          combinedToplineEntryToCombinedToplineSheetValueRow
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
        const targetValues = sourceValues
          .map(toplineSheetValueRowToToplineEntry)
          .map(toplineEntryToCombinedToplineSheetValueRow);
        combinedToplineSheet
          .getRange(
            rowsWritten + 2,
            1,
            sourceValues.length,
            combinedToplineSheetHeaders.length
          )
          .setValues(targetValues);
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

  // Limit the amount of rows of the worksheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the combined topline worksheet to the amount of entries`
  );
  const updatedCombinedToplineSheetData = updatedCombinedToplineSheetValuesIncludingHeaderRow.slice(
    1
  );
  adjustSheetRowsAndColumnsCount(
    combinedToplineSheet,
    updatedCombinedToplineSheetData.length + 1,
    updatedCombinedToplineSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormula(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&INDIRECT("R[0]C[-1]", FALSE),{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    updatedCombinedToplineSheetData.length
  );

  console.info(`End of refreshCombinedToplineSheetListing()`);
  /* tslint:enable:no-console */
}
