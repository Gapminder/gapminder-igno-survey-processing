import groupBy from "lodash/groupBy";
import intersection from "lodash/intersection";
import union from "lodash/union";
import {
  GsDashboardSurveyListingsEntry,
  gsDashboardSurveyListingsSheetValueRowToGsDashboardSurveyListingsEntry,
  importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry
} from "../gsheetsData/hardcodedConstants";
import {
  addGsheetConvertedVersionOfExcelFileToFolder,
  fetchAndVerifyCombinedQuestionsSheet,
  fetchAndVerifyCombinedToplineSheet,
  fetchAndVerifyGsDashboardSurveyListingsSheet,
  fetchAndVerifyImportedIgnoQuestionsInfoSheet,
  fetchAndVerifySurveysSheet,
  gsheetMimeType,
  updateCombinedQuestionSheetFormulasAndCalculatedColumns,
  updateCombinedToplineSheetFormulasAndCalculatedColumns,
  updateSurveysSheetFormulasAndCalculatedColumns,
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
      "Refreshed the surveys and combined listings (based on files in the Google Surveys results folder)."
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
      ) > -1
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

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Read relevant settings
  console.info(`Reading relevant settings`);
  const settingGsResultsFolderNameRange = activeSpreadsheet.getRangeByName(
    "setting_gs_results_folder_name"
  );
  if (settingGsResultsFolderNameRange === null) {
    throw new Error(
      "No named range 'setting_gs_results_folder_name' was found. It is mandatory since it is used to configure what Drive folder the script should look in for uploaded Google Survey results. Please add it to your spreadsheet and run this script again."
    );
  }
  const gsResultsFolderName = String(
    settingGsResultsFolderNameRange.getValue()
  ).trim();
  if (gsResultsFolderName === "") {
    throw new Error(
      "The named range 'setting_gs_results_folder_name' was found empty. It needs to contain the name of the Drive folder the script should look in for uploaded Google Survey results. Please make sure that it is not empty and run this script again."
    );
  }
  console.info(`Read setting gsResultsFolderName: ${gsResultsFolderName}`);

  console.info(`Fetching and verifying existing worksheets`);
  const {
    surveysSheet,
    surveysSheetValuesIncludingHeaderRow
  } = fetchAndVerifySurveysSheet(activeSpreadsheet);
  const {
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedQuestionsSheet(activeSpreadsheet);
  const {
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedToplineSheet(activeSpreadsheet);
  const {
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  } = fetchAndVerifyImportedIgnoQuestionsInfoSheet(activeSpreadsheet);
  const importedIgnoQuestionsInfoSheetValues = importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow.slice(
    1
  );
  const importedIgnoQuestionsInfoEntries = importedIgnoQuestionsInfoSheetValues.map(
    importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry
  );
  const {
    gsDashboardSurveyListingsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyGsDashboardSurveyListingsSheet(activeSpreadsheet);
  const gsDashboardSurveyListingsSheetValues = gsDashboardSurveyListingsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const gsDashboardSurveyListingsEntries = gsDashboardSurveyListingsSheetValues.map(
    gsDashboardSurveyListingsSheetValueRowToGsDashboardSurveyListingsEntry
  );

  // Read files in the gs results folder with the name specified in the relevant settings named range
  // (the first found, in case there are many), ensuring that there is a Gsheet version of each uploaded Excel file
  console.info(
    `Reading files in the folder called "${gsResultsFolderName}", ` +
      `ensuring that there is a Gsheet version of each uploaded Excel file`
  );
  const folders = DriveApp.getFoldersByName(gsResultsFolderName);
  if (!folders.hasNext()) {
    throw Error(`No folder found called "${gsResultsFolderName}"`);
  }
  const gsResultsFolder = folders.next();
  const filesByMimeType = ensureGsheetVersionsOfEachExcelFile(gsResultsFolder);
  const gsResultsFolderGsheetFiles = filesByMimeType[gsheetMimeType];

  console.info(`Refreshing survey listing`);
  const { updatedSurveyEntries } = refreshSurveysSheetListing(
    surveysSheet,
    surveysSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  const gsDashboardSurveyListingsEntriesBySurveyId = groupBy(
    gsDashboardSurveyListingsEntries,
    (gsDashboardSurveyListingsEntry: GsDashboardSurveyListingsEntry) =>
      gsDashboardSurveyListingsEntry.survey_id
  ) as { [survey_id: string]: GsDashboardSurveyListingsEntry[] };

  console.info(
    `Updating formulas and calculated columns for the new surveys sheet rows`
  );
  updateSurveysSheetFormulasAndCalculatedColumns(
    combinedQuestionsSheet,
    updatedSurveyEntries,
    gsDashboardSurveyListingsEntriesBySurveyId,
    updatedSurveyEntries.length - updatedSurveyEntries.length + 2,
    updatedSurveyEntries.length
  );

  console.info(`Refreshing combined topline listing`);
  const {
    updatedCombinedToplineEntries,
    newCombinedToplineEntries
  } = refreshCombinedToplineSheetListing(
    updatedSurveyEntries,
    gsDashboardSurveyListingsEntriesBySurveyId,
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(`Refreshing combined questions listing`);
  const {
    updatedCombinedQuestionEntries,
    newCombinedQuestionEntries
  } = refreshCombinedQuestionsSheetListing(
    updatedSurveyEntries,
    updatedCombinedToplineEntries,
    gsDashboardSurveyListingsEntriesBySurveyId,
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow,
    gsResultsFolderGsheetFiles
  );

  console.info(
    `Updating formulas and calculated columns for the new combined question rows`
  );
  updateCombinedQuestionSheetFormulasAndCalculatedColumns(
    combinedQuestionsSheet,
    newCombinedQuestionEntries,
    updatedCombinedToplineEntries,
    importedIgnoQuestionsInfoEntries,
    gsDashboardSurveyListingsEntriesBySurveyId,
    updatedCombinedQuestionEntries.length -
      newCombinedQuestionEntries.length +
      2,
    newCombinedQuestionEntries.length
  );

  console.info(
    `Updating formulas and calculated columns for the new combined topline rows`
  );
  updateCombinedToplineSheetFormulasAndCalculatedColumns(
    combinedToplineSheet,
    newCombinedToplineEntries,
    newCombinedQuestionEntries, // updatedCombinedQuestionEntries, // Using newCombinedQuestionEntries requires that the corresponding topline and question rows are added in the same update. Using updatedCombinedQuestionEntries requires it to be updated based on the changes to newCombinedQuestionEntries made above
    importedIgnoQuestionsInfoEntries,
    gsDashboardSurveyListingsEntriesBySurveyId,
    updatedCombinedToplineEntries.length - newCombinedToplineEntries.length + 2,
    newCombinedToplineEntries.length
  );

  console.info(
    `Moving processed results files to a subfolder, so that they are not checked/processed again`
  );
  const existingCombinedQuestionSurveyIds = union(
    updatedCombinedQuestionEntries.map(
      existingQuestionEntry => existingQuestionEntry.survey_id
    )
  );
  const existingCombinedToplineSurveyIds = union(
    updatedCombinedToplineEntries.map(
      updatedCombinedToplineEntry => updatedCombinedToplineEntry.survey_id
    )
  );
  const surveyIdsInBothCombinedListings = intersection(
    existingCombinedQuestionSurveyIds,
    existingCombinedToplineSurveyIds
  );
  filesByMimeType[xlsxMimeType].map((excelFile: File) => {
    const fileName = excelFile.getName();
    const surveyId = fileName.replace(".xlsx", "").replace("survey-", "");
    if (surveyIdsInBothCombinedListings.includes(surveyId)) {
      moveFileToSubfolder(gsResultsFolder, excelFile, "Processed");
    }
  });
  filesByMimeType[gsheetMimeType].map((gsheetFile: File) => {
    const fileName = gsheetFile.getName();
    const surveyId = fileName.replace("survey-", "");
    if (surveyIdsInBothCombinedListings.includes(surveyId)) {
      moveFileToSubfolder(gsResultsFolder, gsheetFile, "Processed");
    }
  });

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
      /* tslint:disable:no-console */
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
          moveFileToSubfolder(
            gsResultsFolder,
            existingGsheetFileDuplicate,
            "Moved Duplicates"
          );
        }
      });
      /* tslint:enable:no-console */
    }
  });
  return filesByMimeType;
}

/**
 * @hidden
 */
function moveFileToSubfolder(
  folder: Folder,
  existingFile: File,
  subFolderName: string
) {
  /* tslint:disable:no-console */
  console.log(
    `Moving file "${existingFile.getName()}" to the "${subFolderName}" folder`
  );
  /* tslint:enable:no-console */
  const subFolder = folder.getFoldersByName(subFolderName).next();
  subFolder.addFile(existingFile);
  existingFile
    .getParents()
    .next()
    .removeFile(existingFile);
}
