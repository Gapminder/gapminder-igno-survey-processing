import copy
import typing
from json import dumps
from typing import Tuple

from lib.find_in_list import find_in_list
from lib.gs_combined.schemas import GsAnswerRow, GsQuestionRow, GsSurveyResultsData
from lib.mapping.auto_mark_correctness import auto_mark_correctness
from lib.mapping.summarize_gs_answer import summarize_gs_answer
from lib.mapping.summarize_gs_question import summarize_gs_question


def convert_survey_details_to_gs_question_and_answer_rows(
    survey_details: dict,
    question_rollups_by_question_id: dict,
    gs_survey_results_data: GsSurveyResultsData,
) -> Tuple[list[GsQuestionRow], list[GsAnswerRow]]:
    """Convert survey monkey data to rows that are to be imported in gs_combined."""
    gs_questions = []
    gs_answers = []
    survey_id = survey_details["id"]
    question_number = 0
    print(f'survey with title "{survey_details["title"]}"')  # noqa T201
    for page in survey_details["pages"]:
        print(f'page {page["id"]}')  # noqa T201
        for question in page["questions"]:
            print(  # noqa T201
                f'question {question["id"]} "{question["headings"][0]["heading"]}"'
            )
            question_number = question_number + 1
            rollup = question_rollups_by_question_id[question["id"]]
            answered_count = rollup["summary"][0]["answered"]
            answered_fractions = []
            if "answers" not in question:
                print(dumps(question, indent=2))  # noqa T201
                raise Exception(
                    f"Question has no predefined answer options. "
                    f"Not able to import this survey. "
                    f"Please unselect survey with title "
                    f'"{survey_details["title"]}" and try import again'
                )
            for choice in question["answers"]["choices"]:
                print(f'choice {choice["id"]}')  # noqa T201
                rollup_summary_for_choice = typing.cast(
                    typing.Dict[str, int],
                    find_in_list(rollup["summary"][0]["choices"], "id", choice["id"]),
                )
                answered_choice_count: int = rollup_summary_for_choice["count"]
                answered_fraction = answered_choice_count / answered_count
                gs_answer = summarize_gs_answer(
                    survey_id=survey_id,
                    survey_details=survey_details,
                    question_number=question_number,
                    question=question,
                    choice=choice,
                    answered_fraction=answered_fraction,
                )
                gs_answers.append(gs_answer)
                answered_fractions.append(answered_fraction)
            gs_question = summarize_gs_question(
                survey_id=survey_id,
                survey_details=survey_details,
                question_number=question_number,
                question=question,
                answered_fractions=answered_fractions,
                answered_count=answered_count,
                gs_survey_results_data=gs_survey_results_data,
            )
            gs_questions.append(gs_question)

    # Auto-mark correctness
    gs_answers_before_marking_correctness = copy.deepcopy(gs_answers)
    for gs_answer in gs_answers:
        auto_mark_correctness(
            gs_answer=gs_answer,
            gs_answers_before_marking_correctness=gs_answers_before_marking_correctness,
            gs_questions=gs_questions,
            gs_survey_results_data=gs_survey_results_data,
        )

    return gs_questions, gs_answers
