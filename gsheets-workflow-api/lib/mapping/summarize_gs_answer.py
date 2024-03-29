from lib.gs_combined.schemas import GsAnswerRow
from lib.survey_monkey.survey import Choice, Question, Survey


def summarize_gs_answer(
    survey_id: int,
    survey_details: Survey,
    question_number: int,
    question: Question,
    choice: Choice,
    answered_fraction: float,
) -> GsAnswerRow:
    question_text = (
        question.headings[0].heading
        if question.headings[0].heading
        else "(Image)"
        if question.headings[0].image
        else ""
    )
    gs_answer_row = GsAnswerRow(
        survey_id=survey_id,
        survey_name=survey_details.title,
        survey_question_id=question.id,
        question_number=question_number,
        question_text=question_text,
        answer=choice.text,
        correctness_of_answer_option="",  # manually filled after import
        auto_marked_correctness_of_answer="",  # filled later during import
        answer_by_percent="{:.2%}".format(answered_fraction),
        correct_answer_at_time_of_import="",  # filled later during import
        very_wrong_answer_at_time_of_import="",  # filled later during import
        metadata="",
        weighted_by="",
    )
    return gs_answer_row
