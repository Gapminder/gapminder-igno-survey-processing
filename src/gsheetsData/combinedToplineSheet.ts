/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

/**
 * @hidden
 */
export const combinedToplineSheetHeaders = [
  "Survey ID",
  "Survey Name",
  "Question number",
  "Question text",
  "Answer",
  'Correct? ("x" marks correct answers)',
  "Auto-marked correct answers",
  "Answer by percent",
  "Metadata",
  "Weighted by"
];

/**
 * @hidden
 */
export const combinedToplineSheetName = "topline_combo";

/**
 * @hidden
 */
export interface ToplineEntry {
  survey_id: any;
  question_number: any;
  question_text: any;
  answer: any;
  answer_by_percent: any;
  metadata: any;
  weighted_by: any;
}

/**
 * @hidden
 */
export interface CombinedToplineEntry {
  survey_id: any;
  survey_name: any;
  question_number: any;
  question_text: any;
  answer: any;
  x_marks_correct_answers: any;
  auto_marked_correct_answers: any;
  answer_by_percent: any;
  metadata: any;
  weighted_by: any;
}

/**
 * @hidden
 */
export const toplineSheetValueRowToToplineEntry = (
  toplineSheetRow: any[]
): ToplineEntry => {
  return {
    survey_id: toplineSheetRow[0],
    question_number: toplineSheetRow[1],
    question_text: toplineSheetRow[2],
    answer: toplineSheetRow[3],
    answer_by_percent: toplineSheetRow[4],
    metadata: toplineSheetRow[5],
    weighted_by: toplineSheetRow[6]
  };
};

/**
 * @hidden
 */
export const toplineEntryToCombinedToplineSheetValueRow = (
  toplineEntry: ToplineEntry
) => [
  toplineEntry.survey_id,
  "...", // survey_name formula
  toplineEntry.question_number,
  toplineEntry.question_text,
  toplineEntry.answer,
  "", // x_marks_correct_answers left blank
  "", // auto_marked_correct_answers left blank
  toplineEntry.answer_by_percent,
  toplineEntry.metadata,
  toplineEntry.weighted_by
];

/**
 * @hidden
 */
export const combinedToplineSheetValueRowToCombinedToplineEntry = (
  combinedToplineSheetRow: any[]
): CombinedToplineEntry => {
  return {
    survey_id: combinedToplineSheetRow[0],
    survey_name: combinedToplineSheetRow[1],
    question_number: combinedToplineSheetRow[2],
    question_text: combinedToplineSheetRow[3],
    answer: combinedToplineSheetRow[4],
    x_marks_correct_answers: combinedToplineSheetRow[5],
    auto_marked_correct_answers: combinedToplineSheetRow[6],
    answer_by_percent: combinedToplineSheetRow[7],
    metadata: combinedToplineSheetRow[8],
    weighted_by: combinedToplineSheetRow[9]
  };
};

/**
 * @hidden
 */
export const combinedToplineEntryToCombinedToplineSheetValueRow = (
  combinedToplineEntry: CombinedToplineEntry
) => [
  combinedToplineEntry.survey_id,
  "...", // survey_name formula
  combinedToplineEntry.question_number,
  combinedToplineEntry.question_text,
  combinedToplineEntry.answer,
  combinedToplineEntry.x_marks_correct_answers,
  combinedToplineEntry.answer_by_percent,
  combinedToplineEntry.metadata,
  combinedToplineEntry.weighted_by
];
