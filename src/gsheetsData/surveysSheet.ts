/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

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
