from dataclasses import dataclass

from lib.gsheets.gsheets_worksheet_editor import GsheetsWorksheetEditor

imported_igno_questions_info_sheet_name = "imported_igno_questions_info"
combined_questions_sheet_name = "questions_combo"
combined_topline_sheet_name = "topline_combo"


@dataclass
class GsQuestionRow:
    survey_id: int
    survey_name: str
    survey_question_id: str
    question_number: int
    question_text: str
    igno_index_question_id: str
    auto_mapped_igno_index_question_id: str
    igno_index_question: str
    igno_index_question_correct_answer: str
    igno_index_question_very_wrong_answer: str
    foreign_country_igno_question_id: str
    auto_mapped_foreign_country_igno_question_id: str
    foreign_country_igno_question: str
    foreign_country_igno_index_question_correct_answer: str
    foreign_country_igno_index_question_very_wrong_answer: str
    step5_question_id: str
    auto_mapped_step5_question_id: str
    step5_question: str
    step5_question_correct_answer: str
    step5_question_very_wrong_answer: str
    custom_igno_index_question_id: str
    auto_mapped_custom_igno_index_question_id: str
    custom_igno_index_question: str
    custom_igno_index_question_correct_answer: str
    custom_igno_index_question_very_wrong_answer: str
    response_count: int
    the_answer_options: str
    answers_by_percent: str
    correct_answers: str
    wrong_answers: str
    very_wrong_answers: str
    percent_that_answered_correctly: str
    percent_that_answered_wrong: str
    percent_that_answered_very_wrong: str
    overall_summary: str
    amount_of_answer_options: int
    percent_that_would_have_answered_correctly_in_an_abc_type_question: str
    percent_that_would_have_answered_wrong_in_an_abc_type_question: str
    percent_that_would_have_answered_very_wrong_in_an_abc_type_question: str
    question_text_included_in_survey: str


@dataclass
class GsAnswerRow:
    survey_id: int
    survey_name: str
    survey_question_id: str
    question_number: int
    question_text: str
    answer: str
    correctness_of_answer_option: str
    auto_marked_correctness_of_answer: str
    answer_by_percent: str
    correct_answer_at_time_of_import: str
    very_wrong_answer_at_time_of_import: str
    metadata: str
    weighted_by: str


@dataclass
class GsSurveyResultsData:
    imported_igno_questions_info: GsheetsWorksheetEditor
    questions_combo: GsheetsWorksheetEditor
    topline_combo: GsheetsWorksheetEditor


# Column specifications like these protects us from having to refactor the code when column names change
attributes_to_columns_maps = {
    "gs_combined": {
        "surveys": {
            "survey_name": "Survey Name",
            "input_sheet": "Input Sheet",  # unused
            "survey_batch_id": "Survey Batch ID (WV#/CV#)",  # unused
            "country": "Country",  # unused
            "results_ready_for_import": "Results ready for import",
            "results_imported": "Results imported",
            "sample_size": "Sample Size",
            "survey_date": "Survey Date",
            "filename": "Filename",  # unused after google surveys shut down
            "survey_id": "Survey ID",
            "link_to_results": "Link to results (as first encountered in the Google Surveys results folder)",
            "rows_in_questions_combo": "Number of rows in questions_combo",
            "rows_in_topline_combo": "Number of rows in topline_combo",
            "import_timestamp": "Import timestamp",
            "import_notes": "Import notes",
        },
        "questions_combo": {
            "survey_id": "Survey ID",
            "survey_name": "Survey Name",
            "survey_question_id": "Survey Question ID",
            "question_number": "Question number",
            "question_text": "Question text",
            "igno_index_question_id": "Igno Index Question ID",
            "auto_mapped_igno_index_question_id": "Auto-mapped Igno Index Question ID",
            "igno_index_question": "Igno Index Question",
            "igno_index_question_correct_answer": "Correct Answer to Igno Index Question",
            "igno_index_question_very_wrong_answer": "Very Wrong Answer to Igno Index Question",
            "foreign_country_igno_question_id": "Foreign Country Igno Question ID",
            "auto_mapped_foreign_country_igno_question_id": "Auto-mapped Foreign Country Igno Question ID",
            "foreign_country_igno_question": "Foreign Country Igno Question",
            "foreign_country_igno_index_question_correct_answer": "Correct Answer to Foreign Country Igno Question",
            "foreign_country_igno_index_question_very_wrong_answer": "Very Wrong Answer to Foreign Country Igno Question",
            "step5_question_id": "Step 5 Question ID",
            "auto_mapped_step5_question_id": "Auto-mapped Step 5 Question ID",
            "step5_question": "Step 5 Question",
            "step5_question_correct_answer": "Correct Answer to Step 5 Question",
            "step5_question_very_wrong_answer": "Very Wrong Answer to Step 5 Question",
            "custom_igno_index_question_id": "Custom Igno Index Question ID",
            "auto_mapped_custom_igno_index_question_id": "Auto-mapped Custom Igno Index Question ID",
            "custom_igno_index_question": "Custom Igno Index Question",
            "custom_igno_index_question_correct_answer": "Correct Answer to Custom Igno Index Question",
            "custom_igno_index_question_very_wrong_answer": "Very Wrong Answer to Custom Igno Index Question",
            "response_count": "Response count",
            "the_answer_options": "The answer options",
            "answers_by_percent": "Answers by percent",
            "correct_answers": "Correct answer(s)",
            "wrong_answers": "Wrong answer(s)",
            "very_wrong_answers": "Very wrong answer(s)",
            "percent_that_answered_correctly": "% that answered correctly",
            "percent_that_answered_wrong": "% that answered wrong",
            "percent_that_answered_very_wrong": "% that answered very wrong",
            "overall_summary": "Overall Summary",
            "amount_of_answer_options": "Amount of answer options",
            "percent_that_would_have_answered_correctly_in_an_abc_type_question": "% that would have answered correctly in an abc-type question",
            "percent_that_would_have_answered_wrong_in_an_abc_type_question": "% that would have answered wrong in an abc-type question",
            "percent_that_would_have_answered_very_wrong_in_an_abc_type_question": "% that would have answered very wrong in an abc-type question",
            "question_text_included_in_survey": "Question text included in survey",
        },
        "topline_combo": {
            "survey_id": "Survey ID",
            "survey_name": "Survey Name",
            "survey_question_id": "Survey Question ID",
            "question_number": "Question number",
            "question_text": "Question text",
            "answer": "Answer",
            "correctness_of_answer_option": "Correctness of answer option",
            "auto_marked_correctness_of_answer": "Auto-marked correctness of answers",
            "answer_by_percent": "Answer by percent",
            "correct_answer_at_time_of_import": "Correct answer at time of import",
            "very_wrong_answer_at_time_of_import": "Very wrong answer at time of import",
            "metadata": "Metadata",
            "weighted_by": "Weighted by",
        },
        "imported_igno_questions": {
            # First group - Igno Index
            "igno_index_question_id": "ID\ncombo",
            "igno_index_world_views_survey_batch_number": "WV#",
            "igno_index_question": "Question ",
            "igno_index_question_correct_answer": "Correct Answer",
            "igno_index_question_answer_options": "Answer options",
            "igno_index_question_very_wrong_answer": "Very Wrong Answer - filled out only if it can't be derived numerically",
            # Second group - Foreign Country
            "foreign_country_igno_question_id": "ID combo",
            "country_views_survey_batch_number": "CV#",  # Fixed attribute name to match usage
            "foreign_country_igno_question": "Question .1",
            "foreign_country_igno_index_question_correct_answer": "Correct Answer.1",
            "foreign_country_igno_question_answer_options": "Answer options.1",
            "foreign_country_igno_index_question_very_wrong_answer": "Very Wrong Answer - filled out only if it can't be derived numerically.1",
            # Third group - Step 5
            "step5_question_id": "Step 5 Question ID",
            "step5_study_survey_batch_number": "S#",
            "step5_question_and_translation": "Study Question (EN) + Translation",
            "step5_question": "Question (EN)",
            "step5_question_correct_answer": "Correct Answer (EN)",
            "step5_question_answer_options": "Answer options (EN)",
            "step5_question_very_wrong_answer": "Very Wrong Answer - filled out only if it can't be derived numerically (EN)",
            "step5_question_asking_language": "Asking Language",
            "step5_question_translation_status": "Translation Status",
            "step5_question_translated_question": "Question (translation)",
            "step5_question_translated_question_correct_answer": "Correct Answer (translation)",
            "step5_question_translated_question_answer_options": "Answer options (translation)",
            "step5_question_translated_question_very_wrong_answer": "Very Wrong Answer - filled out only if it can't be derived numerically (translation)",
            # Fourth group - Custom Igno Index
            "custom_igno_index_question_id": "ID\ncombo.1",
            "custom_igno_index_world_views_survey_batch_number": "WV#.1",
            "custom_igno_index_question": "Question .2",
            "custom_igno_index_question_correct_answer": "Correct Answer.2",
            "custom_igno_index_question_answer_options": "Answer options.2",
            "custom_igno_index_question_very_wrong_answer": "Very Wrong Answer - filled out only if it can't be derived numerically.2",
        },
    }
}
