from lib.gs_combined.schemas import (
    GsAnswerRow,
    GsQuestionRow,
    GsSurveyResultsData,
    imported_igno_questions_info_sheet_name,
)
from lib.parsing.answer_option_matches_factual_answer import (
    answer_option_is_the_same_as_factual_answer,
    answer_option_matches_factual_answer,
)
from lib.parsing.chosen_answer_option_distance import (
    chosen_answer_option_is_this_many_answer_options_away_from_factual_answer,
)


def determine_auto_marked_correctness(
    gs_answer: GsAnswerRow,
    gs_answers: list[GsAnswerRow],
    gs_questions: list[GsQuestionRow],
    gs_survey_results_data: GsSurveyResultsData,
) -> tuple[str, str, str, list[GsAnswerRow]]:
    def match_question(q: GsQuestionRow) -> bool:
        return (
            q.survey_id is not None
            and q.survey_id == gs_answer.survey_id
            and q.question_number == gs_answer.question_number
        )

    corresponding_gs_questions = list(filter(match_question, gs_questions))

    if not corresponding_gs_questions or len(corresponding_gs_questions) == 0:
        raise ValueError("(No corresponding question entry found)")
    corresponding_gs_question = corresponding_gs_questions[0]

    def match_answer(a: GsAnswerRow) -> bool:
        return (
            a.survey_id is not None
            and a.survey_id == gs_answer.survey_id
            and a.question_number == gs_answer.question_number
        )

    corresponding_gs_answers = list(filter(match_answer, gs_answers))

    if not corresponding_gs_answers or len(corresponding_gs_answers) == 0:
        raise ValueError("(No corresponding answer option entries found)")

    factual_correct_answer = None
    factual_very_wrong_answer = None
    igno_questions_df = gs_survey_results_data.imported_igno_questions_info.data.df
    if corresponding_gs_question.igno_index_question_id.strip() != "":
        matches = igno_questions_df.apply(
            lambda x: x["igno_index_question_id"]
            and x["igno_index_question_id"]
            == corresponding_gs_question.igno_index_question_id,
            axis=1,
        )
        matching_igno_questions_df = igno_questions_df[matches].fillna("")

        if len(matching_igno_questions_df) == 0:
            raise ValueError(
                f"(No matching imported igno_index_question info "
                f"entry found in {imported_igno_questions_info_sheet_name})"
            )
        factual_correct_answer = matching_igno_questions_df.iloc[0][
            "igno_index_question_correct_answer"
        ]
        factual_very_wrong_answer = matching_igno_questions_df.iloc[0][
            "igno_index_question_very_wrong_answer"
        ]
    elif corresponding_gs_question.foreign_country_igno_question_id.strip() != "":
        matches = igno_questions_df.apply(
            lambda x: x["foreign_country_igno_question_id"]
            and x["foreign_country_igno_question_id"]
            == corresponding_gs_question.foreign_country_igno_question_id,
            axis=1,
        )
        matching_igno_questions_df = igno_questions_df[matches].fillna("")

        if len(matching_igno_questions_df) == 0:
            raise ValueError(
                f"(No matching imported foreign_country_igno_question "
                f"info entry found in {imported_igno_questions_info_sheet_name})"
            )
        factual_correct_answer = matching_igno_questions_df.iloc[0][
            "foreign_country_igno_index_question_correct_answer"
        ]
        factual_very_wrong_answer = matching_igno_questions_df.iloc[0][
            "foreign_country_igno_index_question_very_wrong_answer"
        ]
    elif corresponding_gs_question.step5_question_id.strip() != "":
        matches = igno_questions_df.apply(
            lambda x: x["step5_question_id"]
            and x["step5_question_id"] == corresponding_gs_question.step5_question_id,
            axis=1,
        )
    elif corresponding_gs_question.custom_igno_index_question_id.strip() != "":
        matches = igno_questions_df.apply(
            lambda x: x["custom_igno_index_question_id"]
            and x["custom_igno_index_question_id"]
            == corresponding_gs_question.custom_igno_index_question_id,
            axis=1,
        )
        matching_igno_questions_df = igno_questions_df[matches].fillna("")

        if len(matching_igno_questions_df) == 0:
            raise ValueError(
                f"(No matching imported step5_question info entry "
                f"found in {imported_igno_questions_info_sheet_name})"
            )
        corresponding_imported_igno_questions_info_entry = (
            matching_igno_questions_df.iloc[0]
        )
        factual_correct_answer = (
            corresponding_imported_igno_questions_info_entry[
                "step5_question_correct_answer"
            ]
            if corresponding_imported_igno_questions_info_entry[
                "step5_question_asking_language"
            ]
            == "en"
            else corresponding_imported_igno_questions_info_entry[
                "step5_question_translated_question_correct_answer"
            ]
        )
        factual_very_wrong_answer = (
            corresponding_imported_igno_questions_info_entry[
                "step5_question_very_wrong_answer"
            ]
            if corresponding_imported_igno_questions_info_entry[
                "step5_question_asking_language"
            ]
            == "en"
            else corresponding_imported_igno_questions_info_entry[
                "step5_question_translated_question_very_wrong_answer"
            ]
        )
    else:
        raise ValueError("(Question ID not mapped)")
    if factual_correct_answer is None or str(factual_correct_answer).strip() == "":
        raise ValueError("(No factual answer provided in input sheet)")

    # Find correctness of this answer option
    answer_options = [
        corresponding_gs_answer.answer
        for corresponding_gs_answer in corresponding_gs_answers
    ]

    auto_marked_as_correct = False
    auto_marked_as_wrong = False
    auto_marked_as_very_wrong = False
    correct_answer_options = []

    # Determine numerically if very wrong is not specified
    if (
        factual_very_wrong_answer is None
        or str(factual_very_wrong_answer).strip() == ""
    ):
        # Determine correct answer numerically if possible
        correct_answer_options = [
            answer_option
            for answer_option in answer_options
            if answer_option_matches_factual_answer(
                answer_option, factual_correct_answer
            )
        ]
        if len(correct_answer_options) == 0:
            raise ValueError(
                f"(No answer option numerically matching "
                f'the correct answer "{factual_correct_answer}" found)'
            )
        # Determine very wrong answer numerically if possible
        try:
            func = chosen_answer_option_is_this_many_answer_options_away_from_factual_answer
            answer_options_away_from_factual_answer = func(
                gs_answer.answer, answer_options, factual_correct_answer
            )
            auto_marked_as_very_wrong = answer_options_away_from_factual_answer > 1
        except ValueError as e:
            # Ignore these error situations - simply not auto-marking as very wrong
            if str(e) not in [
                "Answer options not all numerical",
                "No correct answer option found",
            ]:
                raise e
    else:
        correct_answer_options = [
            answer_option
            for answer_option in answer_options
            if answer_option_matches_factual_answer(
                answer_option, factual_correct_answer
            )
        ]
        if len(correct_answer_options) == 0:
            raise ValueError(
                f"(No answer option matching the "
                f'correct answer "{factual_correct_answer}" found)'
            )
        auto_marked_as_very_wrong = answer_option_is_the_same_as_factual_answer(
            gs_answer.answer, factual_very_wrong_answer
        )

    if gs_answer.answer in correct_answer_options:
        auto_marked_as_correct = True
    else:
        auto_marked_as_wrong = True

    auto_marked_correctness = (
        "1"
        if auto_marked_as_correct
        else "3"
        if auto_marked_as_very_wrong
        else "2"
        if auto_marked_as_wrong
        else ""
    )

    return (
        auto_marked_correctness,
        factual_correct_answer,
        factual_very_wrong_answer,
        corresponding_gs_answers,
    )


def auto_mark_correctness(
    gs_answer: GsAnswerRow,
    gs_answers_before_marking_correctness: list[GsAnswerRow],
    gs_questions: list[GsQuestionRow],
    gs_survey_results_data: GsSurveyResultsData,
) -> None:
    try:
        (
            auto_marked_correctness,
            factual_correct_answer,
            factual_very_wrong_answer,
            corresponding_gs_answers,
        ) = determine_auto_marked_correctness(
            gs_answer=gs_answer,
            gs_answers=gs_answers_before_marking_correctness,
            gs_questions=gs_questions,
            gs_survey_results_data=gs_survey_results_data,
        )
        gs_answer.auto_marked_correctness_of_answer = auto_marked_correctness

        # Update the actual x markings if no correct or
        # very wrong answers had been marked previously
        def match_non_empty_answers(a: GsAnswerRow) -> bool:
            return (
                a.correctness_of_answer_option is not None
                and a.correctness_of_answer_option.strip() != ""
            )

        non_empty_answers = list(
            filter(match_non_empty_answers, corresponding_gs_answers)
        )
        if len(non_empty_answers) == 0:
            gs_answer.correctness_of_answer_option = auto_marked_correctness
            gs_answer.correct_answer_at_time_of_import = str(factual_correct_answer)
            gs_answer.very_wrong_answer_at_time_of_import = str(
                factual_very_wrong_answer
            )

    except ValueError as e:
        gs_answer.auto_marked_correctness_of_answer = str(e)
