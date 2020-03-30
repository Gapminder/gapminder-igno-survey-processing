/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

import {
  assertCorrectLeftmostSheetColumnHeaders,
  getSheetDataIncludingHeaderRow
} from "../common";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

/**
 * Note: These headers are informative only and will not match (nor be verified to match) the underlying sheet
 * since the headers are imported from other sheets and may be changed at will.
 * The position of the headers should remain intact.
 * @hidden
 */
export const importedIgnoQuestionsInfoSheetHeaders = [
  "ID\ncombo",
  "WV#",
  "Question ",
  "Correct Answer",
  "Answer options",
  "Very Wrong Answer - filled out only if it can't be derived numerically",
  "ID combo",
  "CV#",
  "Question ",
  "Correct Answer",
  "Answer options",
  "Very Wrong Answer - filled out only if it can't be derived numerically",
  "Step 5 Question ID",
  "S#",
  "Study Question (EN) + Translation",
  "Question (EN)",
  "Correct Answer (EN)",
  "Answer options (EN)",
  "Very Wrong Answer - filled out only if it can't be derived numerically (EN)",
  "Asking Language",
  "Translation Status",
  "Question (translation)",
  "Correct Answer (translation)",
  "Answer options (translation)",
  "Very Wrong Answer - filled out only if it can't be derived numerically (translation)"
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
  step5_question_and_translation: any;
  step5_question: any;
  step5_question_correct_answer: any;
  step5_question_answer_options: any;
  step5_question_very_wrong_answer: any;
  step5_question_asking_language: any;
  step5_question_translation_status: any;
  step5_question_translated_question: any;
  step5_question_translated_question_correct_answer: any;
  step5_question_translated_question_answer_options: any;
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
    step5_question_and_translation: importedIgnoQuestionsInfoSheetRow[15],
    step5_question: importedIgnoQuestionsInfoSheetRow[16],
    step5_question_correct_answer: importedIgnoQuestionsInfoSheetRow[17],
    step5_question_answer_options: importedIgnoQuestionsInfoSheetRow[18],
    step5_question_very_wrong_answer: importedIgnoQuestionsInfoSheetRow[19],
    step5_question_asking_language: importedIgnoQuestionsInfoSheetRow[20],
    step5_question_translation_status: importedIgnoQuestionsInfoSheetRow[21],
    step5_question_translated_question: importedIgnoQuestionsInfoSheetRow[22],
    step5_question_translated_question_correct_answer:
      importedIgnoQuestionsInfoSheetRow[23],
    step5_question_translated_question_answer_options:
      importedIgnoQuestionsInfoSheetRow[24],
    step5_question_translated_question_very_wrong_answer:
      importedIgnoQuestionsInfoSheetRow[25]
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

  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    importedIgnoQuestionsInfoSheetHeaders,
    importedIgnoQuestionsInfoSheetName,
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  );

  return {
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  };
}
