from json import dumps
from typing import List

from lib.app_singleton import app_logger
from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Question


def print_question_import_details(
    question: Question,
    rollup: QuestionRollup,
    submitted_answers: List[List[Answer]],
) -> None:
    app_logger.debug(
        "question: {question}", {"question": dumps(question.dict(), indent=2)}
    )
    app_logger.debug("rollup: {rollup}", {"rollup": dumps(rollup.dict(), indent=2)})
    app_logger.debug(
        "submitted_answers: {submitted_answers}",
        {"submitted_answers": dumps(submitted_answers, indent=2)},
    )
