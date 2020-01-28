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
  "Foreign Country Igno Question ID",
  "Igno Index Question",
  "Foreign Country Igno Question",
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
export const surveysSheetValueRowToSurveyEntry = (surveysSheetRow: any[]) => {
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
export const surveyEntryToSurveysSheetValueRow = updatedSurveyEntry => [
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
export const overviewSheetValueRowToOverviewEntry = (
  overviewSheetRow: any[]
) => {
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
export const overviewEntryToCombinedQuestionSheetValueRow = overviewEntry => [
  overviewEntry.survey_id,
  "...", // survey_name formula
  overviewEntry.question_number,
  overviewEntry.question_text,
  "", // igno_index_question_id blank on new rows
  "", // foreign_country_igno_question_id blank on new rows
  "...", // igno_index_question formula
  "...", // foreign_country_igno_question formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  overviewEntry.response_count,
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
) => {
  return {
    survey_id: combinedQuestionsSheetRow[0],
    survey_name: combinedQuestionsSheetRow[1],
    question_number: combinedQuestionsSheetRow[2],
    question_text: combinedQuestionsSheetRow[3],
    igno_index_question_id: combinedQuestionsSheetRow[4],
    foreign_country_igno_question_id: combinedQuestionsSheetRow[5],
    igno_index_question: combinedQuestionsSheetRow[6],
    foreign_country_igno_question: combinedQuestionsSheetRow[7],
    // winning_answer: combinedQuestionsSheetRow[8], // Ignoring this column since it is confusing next to the others
    response_count: combinedQuestionsSheetRow[8],
    the_answer_options: combinedQuestionsSheetRow[9],
    answers_by_percent: combinedQuestionsSheetRow[10],
    correct_answers: combinedQuestionsSheetRow[11],
    percent_that_answered_correctly: combinedQuestionsSheetRow[12],
    overall_summary: combinedQuestionsSheetRow[13],
    amount_of_answer_options: combinedQuestionsSheetRow[14],
    percent_that_would_have_answered_correctly_in_an_abc_type_question:
      combinedQuestionsSheetRow[15]
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
  questionEntry.foreign_country_igno_question_id,
  "...", // igno_index_question formula
  "...", // foreign_country_igno_question formula
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
export const toplineSheetValueRowToToplineEntry = (toplineSheetRow: any[]) => {
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
export const toplineEntryToCombinedToplineSheetValueRow = toplineEntry => [
  toplineEntry.survey_id,
  "...", // survey_name formula
  toplineEntry.question_number,
  toplineEntry.question_text,
  toplineEntry.answer,
  "", // x_marks_correct_answers left blank
  toplineEntry.answer_by_percent,
  toplineEntry.metadata,
  toplineEntry.weighted_by
];

/**
 * @hidden
 */
export const combinedToplineSheetValueRowToCombinedToplineEntry = (
  combinedToplineSheetRow: any[]
) => {
  return {
    survey_id: combinedToplineSheetRow[0],
    survey_name: combinedToplineSheetRow[1],
    question_number: combinedToplineSheetRow[2],
    question_text: combinedToplineSheetRow[3],
    answer: combinedToplineSheetRow[4],
    x_marks_correct_answers: combinedToplineSheetRow[5],
    answer_by_percent: combinedToplineSheetRow[6],
    metadata: combinedToplineSheetRow[7],
    weighted_by: combinedToplineSheetRow[8]
  };
};

/**
 * @hidden
 */
export const combinedToplineEntryToCombinedToplineSheetValueRow = combinedToplineEntry => [
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
