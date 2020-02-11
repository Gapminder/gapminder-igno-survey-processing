import difference from "lodash/difference";
import {
  combinedQuestionsSheetName,
  combinedToplineSheetName,
  surveyEntryToSurveysSheetValueRow,
  surveysSheetHeaders,
  surveysSheetValueRowToSurveyEntry
} from "../gsheetsData/hardcodedConstants";
import {
  adjustSheetRowsAndColumnsCount,
  fillColumnWithFormulas
} from "./common";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import File = GoogleAppsScript.Drive.File;

/**
 * @hidden
 */
export function refreshSurveysSheetListing(
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
        existingSurveyEntry.link_if_found_in_gs_results_folder = matchingGsResultsFolderGsheetFile.getUrl();
      }
      return existingSurveyEntry;
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

  return { updatedSurveyEntries };
}
