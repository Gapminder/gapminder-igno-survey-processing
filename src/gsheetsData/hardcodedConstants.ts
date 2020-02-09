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
export const combinedQuestionsSheetName = "questions_combo";

/**
 * @hidden
 */
export const combinedToplineSheetName = "topline_combo";

/**
 * @hidden
 */
export const gsDashboardSurveyListingsSheetName =
  "gs_dashboard_surveys_listing";

/**
 * @hidden
 */
export const gsResultsFolderName = "gs_results";

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
  "Link to results (if found in gs_results folder)",
  "Number of rows in questions_combo",
  "Number of rows in topline_combo"
];

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
export const gsDashboardSurveyListingsSheetHeaders = [
  "Survey ID",
  "Survey Name & Link",
  "Status",
  "Created",
  "Last run",
  "Next run",
  "URL"
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
  answer_to_igno_index_question: any;
  foreign_country_igno_question: any;
  answer_to_foreign_country_igno_question: any;
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
  "", // answer_to_foreign_country_igno_question blank on new rows
  "...", // igno_index_question formula
  "...", // answer_to_igno_index_question formula
  "...", // foreign_country_igno_question formula
  "...", // answer_to_foreign_country_igno_question formula
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
    answer_to_igno_index_question: combinedQuestionsSheetRow[9],
    foreign_country_igno_question: combinedQuestionsSheetRow[10],
    answer_to_foreign_country_igno_question: combinedQuestionsSheetRow[11],
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
  "...", // answer_to_igno_index_question formula
  "...", // foreign_country_igno_question formula
  "...", // answer_to_foreign_country_igno_question formula
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
