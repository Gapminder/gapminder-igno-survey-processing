/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

import { getSheetDataIncludingHeaderRow } from "../common";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

/**
 * Note: These headers are informative only and will not match (nor be verified to match) the underlying sheet
 * since the headers are imported from other sheets and may be changed at will.
 * The position of the headers should remain intact.
 * @hidden
 */
export const importedIgnoQuestionsInfoSheetHeaders = [
  "igno_index_question_id",
  "igno_index_world_views_survey_batch_number",
  "igno_index_question",
  "igno_index_question_correct_answer",
  "igno_index_question_answer_options",
  "igno_index_question_very_wrong_answer",
  "foreign_country_igno_question_id",
  "foreign_country_country_views_survey_batch_number",
  "foreign_country_igno_question",
  "foreign_country_igno_index_question_correct_answer",
  "foreign_country_igno_question_answer_options",
  "foreign_country_igno_index_question_very_wrong_answer",
  "step5_question_id",
  "step5_study_survey_batch_number",
  "step5_question",
  "step5_question_correct_answer",
  "step5_question_answer_options",
  "step5_question_very_wrong_answer",
  "step5_question_asking_language",
  "step5_question_translation_status",
  "step5_question_translated_question",
  "step5_question_translated_question_correct_answer",
  "step5_question_translated_question_very_wrong_answer"
];

/**
 * @hidden
 */
export const importedIgnoQuestionsInfoSheetName =
  "imported_igno_questions_info";

/**
 * @hidden
 */
export interface ImportedIgnoQuestionsInfoEntry {
  igno_index_question_id: any;
  igno_index_world_views_survey_batch_number: any;
  igno_index_question: any;
  igno_index_question_correct_answer: any;
  igno_index_question_answer_options: any;
  igno_index_question_very_wrong_answer: any;
  foreign_country_igno_question_id: any;
  foreign_country_country_views_survey_batch_number: any;
  foreign_country_igno_question: any;
  foreign_country_igno_index_question_correct_answer: any;
  foreign_country_igno_question_answer_options: any;
  foreign_country_igno_index_question_very_wrong_answer: any;
  step5_question_id: any;
  step5_study_survey_batch_number: any;
  study_original_question_and_translation: any;
  step5_question: any;
  step5_question_correct_answer: any;
  step5_question_answer_options: any;
  step5_question_very_wrong_answer: any;
  step5_question_asking_language: any;
  step5_question_translation_status: any;
  step5_question_translated_question: any;
  step5_question_translated_question_correct_answer: any;
  step5_question_translated_question_very_wrong_answer: any;
}

/**
 * @hidden
 */
export const importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry = (
  importedIgnoQuestionsInfoSheetRow: any[]
): ImportedIgnoQuestionsInfoEntry => {
  return {
    igno_index_question_id: importedIgnoQuestionsInfoSheetRow[0],
    igno_index_world_views_survey_batch_number:
      importedIgnoQuestionsInfoSheetRow[1],
    igno_index_question: importedIgnoQuestionsInfoSheetRow[2],
    igno_index_question_correct_answer: importedIgnoQuestionsInfoSheetRow[3],
    igno_index_question_answer_options: importedIgnoQuestionsInfoSheetRow[4],
    igno_index_question_very_wrong_answer: importedIgnoQuestionsInfoSheetRow[5],
    foreign_country_igno_question_id: importedIgnoQuestionsInfoSheetRow[6],
    foreign_country_country_views_survey_batch_number:
      importedIgnoQuestionsInfoSheetRow[7],
    foreign_country_igno_question: importedIgnoQuestionsInfoSheetRow[8],
    foreign_country_igno_index_question_correct_answer:
      importedIgnoQuestionsInfoSheetRow[9],
    foreign_country_igno_question_answer_options:
      importedIgnoQuestionsInfoSheetRow[10],
    foreign_country_igno_index_question_very_wrong_answer:
      importedIgnoQuestionsInfoSheetRow[11],
    step5_question_id: importedIgnoQuestionsInfoSheetRow[12],
    step5_study_survey_batch_number: importedIgnoQuestionsInfoSheetRow[13],
    study_original_question_and_translation:
      importedIgnoQuestionsInfoSheetRow[14],
    step5_question: importedIgnoQuestionsInfoSheetRow[15],
    step5_question_correct_answer: importedIgnoQuestionsInfoSheetRow[16],
    step5_question_answer_options: importedIgnoQuestionsInfoSheetRow[17],
    step5_question_very_wrong_answer: importedIgnoQuestionsInfoSheetRow[18],
    step5_question_asking_language: importedIgnoQuestionsInfoSheetRow[19],
    step5_question_translation_status: importedIgnoQuestionsInfoSheetRow[20],
    step5_question_translated_question: importedIgnoQuestionsInfoSheetRow[21],
    step5_question_translated_question_correct_answer:
      importedIgnoQuestionsInfoSheetRow[22],
    step5_question_translated_question_very_wrong_answer:
      importedIgnoQuestionsInfoSheetRow[23]
  };
};

/**
 * @hidden
 */
export function fetchAndVerifyImportedIgnoQuestionsInfoSheet(
  activeSpreadsheet: Spreadsheet
) {
  const importedIgnoQuestionsInfoSheet = activeSpreadsheet.getSheetByName(
    importedIgnoQuestionsInfoSheetName
  );
  if (importedIgnoQuestionsInfoSheet === null) {
    throw new Error(
      `The required sheet "${importedIgnoQuestionsInfoSheetName}" is missing. Please add it and run this script again.`
    );
  }
  const importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetHeaders
  );
  return {
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  };
}
