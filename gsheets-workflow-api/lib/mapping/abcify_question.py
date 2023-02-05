from typing import List, Tuple

from lib.mapping.utils import print_question_import_details
from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Question


def abcify_question(
    question: Question,
    rollup: QuestionRollup,
    submitted_answers: List[List[Answer]],
) -> Tuple[Question, QuestionRollup]:
    print_question_import_details(question, rollup, submitted_answers)
    # TODO: take submitted_answers into account
    return question, rollup
