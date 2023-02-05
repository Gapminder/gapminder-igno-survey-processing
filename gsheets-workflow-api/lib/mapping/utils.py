from json import dumps
from typing import List

from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Question


def print_question_import_details(
    question: Question,
    rollup: QuestionRollup,
    submitted_answers: List[List[Answer]],
) -> None:
    print("question", dumps(question.dict(), indent=2))  # noqa T201
    print("rollup", dumps(rollup.dict(), indent=2))  # noqa T201
    print("submitted_answers", submitted_answers)  # noqa T201
