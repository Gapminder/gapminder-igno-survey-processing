from lib.gs_combined.schemas import GsQuestionRow, GsSurveyResultsData
from lib.mapping.map_question_ids import (
    map_foreign_country_igno_question_id,
    map_igno_index_question_id,
    map_step5_question_id,
    map_custom_igno_index_question_id,
)
from lib.survey_monkey.survey import Question, Survey


def summarize_gs_question(
    survey_id: int,
    survey_details: Survey,
    question_number: int,
    question: Question,
    answered_fractions: list,
    answered_count: int,
    gs_survey_results_data: GsSurveyResultsData,
) -> GsQuestionRow:
    template_gs_question = gs_survey_results_data.questions_combo.data.df.iloc[0]

    if question.answers:
        the_answer_options = " - ".join(
            choice.text for choice in question.answers.choices
        )
        answers_by_percent = " - ".join(
            "{:.2%}".format(answered_fraction)
            for answered_fraction in answered_fractions
        )
        amount_of_answer_options = len(question.answers.choices)
    else:
        the_answer_options = ""
        answers_by_percent = ""
        amount_of_answer_options = -1

    question_text = (
        question.headings[0].heading
        if question.headings[0].heading
        else "(Image)"
        if question.headings[0].image
        else ""
    )
    gs_question_row = GsQuestionRow(
        survey_id=survey_id,
        survey_name=survey_details.title,
        survey_question_id=question.id,
        question_number=question_number,
        question_text=question_text,
        igno_index_question_id="",
        auto_mapped_igno_index_question_id="",  # Mapped below
        igno_index_question=template_gs_question["igno_index_question"],
        igno_index_question_correct_answer=template_gs_question[
            "igno_index_question_correct_answer"
        ],
        igno_index_question_very_wrong_answer=template_gs_question[
            "igno_index_question_very_wrong_answer"
        ],
        foreign_country_igno_question_id="",
        auto_mapped_foreign_country_igno_question_id="",  # Mapped below
        foreign_country_igno_question=template_gs_question[
            "foreign_country_igno_question"
        ],
        foreign_country_igno_index_question_correct_answer=template_gs_question[
            "foreign_country_igno_index_question_correct_answer"
        ],
        foreign_country_igno_index_question_very_wrong_answer=template_gs_question[
            "foreign_country_igno_index_question_very_wrong_answer"
        ],
        step5_question_id="",
        auto_mapped_step5_question_id="",  # Mapped below
        step5_question=template_gs_question["step5_question"],
        step5_question_correct_answer=template_gs_question[
            "step5_question_correct_answer"
        ],
        step5_question_very_wrong_answer=template_gs_question[
            "step5_question_very_wrong_answer"
        ],
        custom_igno_index_question_id="",
        auto_mapped_custom_igno_index_question_id="",  # Mapped below
        custom_igno_index_question=template_gs_question["custom_igno_index_question"],
        custom_igno_index_question_correct_answer=template_gs_question[
            "custom_igno_index_question_correct_answer"
        ],
        custom_igno_index_question_very_wrong_answer=template_gs_question[
            "custom_igno_index_question_very_wrong_answer"
        ],
        response_count=answered_count,
        the_answer_options=the_answer_options,
        answers_by_percent=answers_by_percent,
        correct_answers=template_gs_question["correct_answers"],
        wrong_answers=template_gs_question["wrong_answers"],
        very_wrong_answers=template_gs_question["very_wrong_answers"],
        percent_that_answered_correctly=template_gs_question[
            "percent_that_answered_correctly"
        ],
        percent_that_answered_wrong=template_gs_question["percent_that_answered_wrong"],
        percent_that_answered_very_wrong=template_gs_question[
            "percent_that_answered_very_wrong"
        ],
        overall_summary=template_gs_question["overall_summary"],
        amount_of_answer_options=amount_of_answer_options,
        percent_that_would_have_answered_correctly_in_an_abc_type_question=template_gs_question[
            "percent_that_would_have_answered_correctly_in_an_abc_type_question"
        ],
        percent_that_would_have_answered_wrong_in_an_abc_type_question=template_gs_question[
            "percent_that_would_have_answered_wrong_in_an_abc_type_question"
        ],
        percent_that_would_have_answered_very_wrong_in_an_abc_type_question=template_gs_question[
            "percent_that_would_have_answered_very_wrong_in_an_abc_type_question"
        ],
        question_text_included_in_survey=question_text,
    )

    map_igno_index_question_id(
        gs_question_row=gs_question_row,
        gs_survey_results_data=gs_survey_results_data,
    )
    map_foreign_country_igno_question_id(
        gs_question_row=gs_question_row,
        gs_survey_results_data=gs_survey_results_data,
    )
    map_step5_question_id(
        gs_question_row=gs_question_row,
        gs_survey_results_data=gs_survey_results_data,
    )
    map_custom_igno_index_question_id(
        gs_question_row=gs_question_row,
        gs_survey_results_data=gs_survey_results_data,
    )

    return gs_question_row
