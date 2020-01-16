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
export const combinedToplineSheetName = "topline_combo";

/**
 * @hidden
 */
export const gsResultsFolderName = "gs_results";

/**
 * @hidden
 */
export const surveysSheetHeaders = [
  "survey_name",
  "file_name",
  "link_if_found_in_gs_results_folder",
  "number_of_rows_in_topline_combo"
];

/**
 * @hidden
 */
export const combinedToplineSheetHeaders = [
  "Survey ID",
  "Question number",
  "Question text",
  "Answer",
  "Answer by percent",
  "Metadata",
  "Weighted by"
];

/**
 * @hidden
 */
export const surveysSheetValueRowToSurveyEntry = (surveysSheetRow: any[]) => {
  return {
    survey_name: surveysSheetRow[0],
    file_name: surveysSheetRow[1],
    link_if_found_in_gs_results_folder: surveysSheetRow[2]
  };
};

/**
 * @hidden
 */
export const surveyEntryToSurveysSheetValueRow = updatedSurveyEntry => [
  updatedSurveyEntry.survey_name,
  updatedSurveyEntry.file_name,
  updatedSurveyEntry.link_if_found_in_gs_results_folder
];

/**
 * @hidden
 */
export const combinedToplineSheetValueRowToToplineEntry = (
  combinedToplineSheetRow: any[]
) => {
  return {
    survey_id: combinedToplineSheetRow[0],
    question_number: combinedToplineSheetRow[1],
    question_text: combinedToplineSheetRow[2],
    answer: combinedToplineSheetRow[3],
    answer_by_percent: combinedToplineSheetRow[4],
    metadata: combinedToplineSheetRow[5],
    weighted_by: combinedToplineSheetRow[6]
  };
};

/**
 * @hidden
 */
export const toplineEntryToCombinedToplineSheetValueRow = toplineEntry => [
  toplineEntry.survey_id,
  toplineEntry.question_number,
  toplineEntry.question_text,
  toplineEntry.answer,
  toplineEntry.answer_by_percent,
  toplineEntry.metadata,
  toplineEntry.weighted_by
];
