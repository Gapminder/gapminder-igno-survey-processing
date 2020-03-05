/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

/**
 * @hidden
 */
export const combinedQuestionsSheetHeaders = [
  "Survey ID",
  "Survey Name",
  "Question number",
  "Question text",
  "Igno Index Question ID",
  "Auto-mapped Igno Index Question ID",
  "Foreign Country Igno Question ID",
  "Auto-mapped Foreign Country Igno Question ID",
  "Igno Index Question",
  "Answer to Igno Index Question",
  "Foreign Country Igno Question",
  "Answer to Foreign Country Igno Question",
  // "Winning answer", // Ignoring this column since it is confusing next to the others
  "Response count",
  "The answer options",
  "Answers by percent",
  "Correct answer(s)",
  "% that answered correctly",
  "Overall Summary",
  "Amount of answer options",
  "% that would have answered correctly in an abc-type question"
];

/**
 * @hidden
 */
export const combinedQuestionsSheetName = "questions_combo";

/**
 * @hidden
 */
export interface QuestionEntry {
  survey_id: any;
  question_number: any;
  question_text: any;
  winning_answer: any;
  response_count: any;
}

/**
 * @hidden
 */
export interface CombinedQuestionEntry {
  survey_id: any;
  survey_name: any;
  question_number: any;
  question_text: any;
  igno_index_question_id: any;
  auto_mapped_igno_index_question_id: any;
  foreign_country_igno_question_id: any;
  auto_mapped_foreign_country_igno_question_id: any;
  igno_index_question: any;
  igno_index_question_correct_answer: any;
  foreign_country_igno_question: any;
  foreign_country_igno_question_correct_answer: any;
  // winning_answer: any; // Ignoring this column since it is confusing next to the others
  response_count: any;
  the_answer_options: any;
  answers_by_percent: any;
  correct_answers: any;
  percent_that_answered_correctly: any;
  overall_summary: any;
  amount_of_answer_options: any;
  percent_that_would_have_answered_correctly_in_an_abc_type_question: any;
}

/**
 * @hidden
 */
export const overviewSheetValueRowToQuestionEntry = (
  overviewSheetRow: any[]
): QuestionEntry => {
  return {
    survey_id: overviewSheetRow[0],
    question_number: overviewSheetRow[1],
    question_text: overviewSheetRow[2],
    winning_answer: overviewSheetRow[3],
    response_count: overviewSheetRow[4]
  };
};

/**
 * @hidden
 */
export const questionEntryToCombinedQuestionSheetValueRow = (
  questionEntry: QuestionEntry
) => [
  questionEntry.survey_id,
  "...", // survey_name formula
  questionEntry.question_number,
  questionEntry.question_text,
  "", // igno_index_question_id blank on new rows
  "", // auto_mapped_igno_index_question_id blank on new rows
  "", // foreign_country_igno_question_id blank on new rows
  "", // auto_mapped_foreign_country_igno_question_id blank on new rows
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_question_correct_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "..." // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
];

/**
 * @hidden
 */
export const combinedQuestionsSheetValueRowToCombinedQuestionEntry = (
  combinedQuestionsSheetRow: any[]
): CombinedQuestionEntry => {
  return {
    survey_id: combinedQuestionsSheetRow[0],
    survey_name: combinedQuestionsSheetRow[1],
    question_number: combinedQuestionsSheetRow[2],
    question_text: combinedQuestionsSheetRow[3],
    igno_index_question_id: combinedQuestionsSheetRow[4],
    auto_mapped_igno_index_question_id: combinedQuestionsSheetRow[5],
    foreign_country_igno_question_id: combinedQuestionsSheetRow[6],
    auto_mapped_foreign_country_igno_question_id: combinedQuestionsSheetRow[7],
    igno_index_question: combinedQuestionsSheetRow[8],
    igno_index_question_correct_answer: combinedQuestionsSheetRow[9],
    foreign_country_igno_question: combinedQuestionsSheetRow[10],
    foreign_country_igno_question_correct_answer: combinedQuestionsSheetRow[11],
    // winning_answer: combinedQuestionsSheetRow[12], // Ignoring this column since it is confusing next to the others
    response_count: combinedQuestionsSheetRow[12],
    the_answer_options: combinedQuestionsSheetRow[13],
    answers_by_percent: combinedQuestionsSheetRow[14],
    correct_answers: combinedQuestionsSheetRow[15],
    percent_that_answered_correctly: combinedQuestionsSheetRow[16],
    overall_summary: combinedQuestionsSheetRow[17],
    amount_of_answer_options: combinedQuestionsSheetRow[18],
    percent_that_would_have_answered_correctly_in_an_abc_type_question:
      combinedQuestionsSheetRow[19]
  };
};

/**
 * @hidden
 */
export const questionEntryToCombinedQuestionsSheetValueRow = questionEntry => [
  questionEntry.survey_id,
  "...", // survey_name formula
  questionEntry.question_number,
  questionEntry.question_text,
  questionEntry.igno_index_question_id,
  questionEntry.auto_mapped_igno_index_question_id,
  questionEntry.foreign_country_igno_question_id,
  questionEntry.auto_mapped_foreign_country_igno_question_id,
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_question_correct_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "..." // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
];
