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
  "Igno Question ID",
  "Igno Question World Views Survey Batch Number",
  "Igno Question",
  "Igno Question Correct Answer",
  "Igno Question Answer Options",
  "Igno Question Very Wrong Answer",
  "Foreign Country Question ID",
  "Foreign Country Country Views Survey Batch Number",
  "Foreign Country Question",
  "Foreign Country Question Correct Answer",
  "Foreign Country Question Answer Options",
  "Foreign Country Question Very Wrong Answer"
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
  foreign_country_igno_question_correct_answer: any;
  foreign_country_igno_question_answer_options: any;
  foreign_country_igno_question_very_wrong_answer: any;
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
    foreign_country_igno_question_correct_answer:
      importedIgnoQuestionsInfoSheetRow[9],
    foreign_country_igno_question_answer_options:
      importedIgnoQuestionsInfoSheetRow[10],
    foreign_country_igno_question_very_wrong_answer:
      importedIgnoQuestionsInfoSheetRow[11]
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
