/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

import {
  assertCorrectLeftmostSheetColumnHeaders,
  createSheet,
  fillColumnWithFormulas,
  fillColumnWithValues,
  getSheetDataIncludingHeaderRow,
  lookupGsDashboardSurveyListing
} from "../common";
import { combinedQuestionsSheetName } from "./combinedQuestionsSheet";
import { combinedToplineSheetName } from "./combinedToplineSheet";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { GsDashboardSurveyListingsEntry } from "./gsDashboardSurveyListingsSheet";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * @hidden
 */
export const surveysSheetName = "surveys";

/**
 * @hidden
 */
export const surveysSheetHeaders = [
  "Survey Name",
  "Input Sheet",
  "Survey Batch ID (WV#/CV#)",
  "Country",
  "Sample Size",
  "Survey Date",
  "Filename",
  "Link to results (as first encountered in the Google Surveys results folder)",
  "Number of rows in questions_combo",
  "Number of rows in topline_combo"
];

/**
 * @hidden
 */
export interface SurveyEntry {
  survey_name: any;
  input_sheet: any;
  survey_batch_id: any;
  country: any;
  sample_size: any;
  survey_date: any;
  file_name: any;
  link_if_found_in_gs_results_folder: any;
}

/**
 * @hidden
 */
export const surveysSheetValueRowToSurveyEntry = (
  surveysSheetRow: any[]
): SurveyEntry => {
  return {
    survey_name: surveysSheetRow[0],
    input_sheet: surveysSheetRow[1],
    survey_batch_id: surveysSheetRow[2],
    country: surveysSheetRow[3],
    sample_size: surveysSheetRow[4],
    survey_date: surveysSheetRow[5],
    file_name: surveysSheetRow[6],
    link_if_found_in_gs_results_folder: surveysSheetRow[7]
  };
};

/**
 * @hidden
 */
export const surveyEntryToSurveysSheetValueRow = (
  updatedSurveyEntry: SurveyEntry
) => [
  "...", // survey_name formula
  updatedSurveyEntry.input_sheet,
  updatedSurveyEntry.survey_batch_id,
  updatedSurveyEntry.country,
  "...", // sample_size formula
  "...", // survey_date formula
  updatedSurveyEntry.file_name,
  updatedSurveyEntry.link_if_found_in_gs_results_folder
];

/**
 * @hidden
 */
export function fetchAndVerifySurveysSheet(activeSpreadsheet: Spreadsheet) {
  let surveysSheet = activeSpreadsheet.getSheetByName(surveysSheetName);
  if (surveysSheet === null) {
    surveysSheet = createSheet(
      activeSpreadsheet,
      surveysSheetName,
      surveysSheetHeaders
    );
  }
  const surveysSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    surveysSheet,
    surveysSheetHeaders
  );
  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    surveysSheetHeaders,
    surveysSheetName,
    surveysSheetValuesIncludingHeaderRow
  );
  return { surveysSheet, surveysSheetValuesIncludingHeaderRow };
}

/**
 * @hidden
 */
export function updateSurveysSheetFormulasAndCalculatedColumns(
  surveysSheet: Sheet,
  surveyEntries: SurveyEntry[],
  gsDashboardSurveyListingsEntriesBySurveyId: {
    [survey_id: string]: GsDashboardSurveyListingsEntry[];
  },
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  if (numRows === 0) {
    console.info(`No rows to update, skipping`);
    return;
  }

  console.info(`Start of updateSurveysSheetFormulasAndCalculatedColumns()`);

  console.info(
    `Filling formula / calculated value columns for ${numRows} rows`
  );

  fillColumnWithValues(
    surveysSheet,
    surveysSheetHeaders,
    "Survey Name",
    rowNumber => {
      const surveyEntry = surveyEntries[rowNumber - startRow];
      const gsDashboardSurveyListing = lookupGsDashboardSurveyListing(
        surveyEntry.file_name.replace("survey-", ""),
        gsDashboardSurveyListingsEntriesBySurveyId
      );
      if (!gsDashboardSurveyListing) {
        return "(No survey name information found)";
      }
      surveyEntry.survey_name = gsDashboardSurveyListing.survey_name_and_link;
      return surveyEntry.survey_name;
    },
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    surveysSheet,
    surveysSheetHeaders,
    "Sample Size",
    `=SUBSTITUTE(SUBSTITUTE(VLOOKUP(SUBSTITUTE(G[ROW],"survey-",""),gs_dashboard_surveys_listing!$A$2:$G,3,FALSE),"Complete","")," responses","")`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    surveysSheet,
    surveysSheetHeaders,
    "Survey Date",
    `=VLOOKUP(SUBSTITUTE(G[ROW],"survey-",""),gs_dashboard_surveys_listing!$A$2:$G,4,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    surveysSheet,
    surveysSheetHeaders,
    "Number of rows in questions_combo",
    `=IF(G[ROW]="","",COUNTIF(${combinedQuestionsSheetName}!$A$2:$A, SUBSTITUTE(G[ROW],"survey-","")))`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    surveysSheet,
    surveysSheetHeaders,
    "Number of rows in topline_combo",
    `=IF(G[ROW]="","",COUNTIF(${combinedToplineSheetName}!$A$2:$A, SUBSTITUTE(G[ROW],"survey-","")))`,
    startRow,
    numRows
  );

  console.info(`End of updateSurveysSheetFormulasAndCalculatedColumns()`);
  /* tslint:enable:no-console */
}
