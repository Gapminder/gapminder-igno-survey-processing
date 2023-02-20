from typing import List, Tuple

import pandas as pd

from lib.mapping.utils import print_question_import_details
from lib.survey_monkey.question_rollup import ChoiceSummary, QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Answers, Choice, Question

NUMBER_OF_SIMULATED_CHOICES = 9


def choicify_question(
    question: Question,
    rollup: QuestionRollup,
    submitted_answers: List[List[Answer]],
) -> Tuple[Question, QuestionRollup]:
    """
    Supplies multiple-choice choices for non multiple-choice questions.

    Converts the answers summary (question rollup) for questions that were
    not multiple-choice questions into a corresponding answer summary as
    if they were multiple-choice questions
    """
    if question.display_options and question.display_options.display_type == "slider":
        return choicify_slider_question(question, rollup, submitted_answers)
    return question, rollup


def choicify_slider_question(
    original_question: Question,
    original_rollup: QuestionRollup,
    original_submitted_answers: List[List[Answer]],
) -> Tuple[Question, QuestionRollup]:

    if (
        not original_question.validation
        or original_question.validation.type != "integer"
    ):
        print_question_import_details(
            original_question, original_rollup, original_submitted_answers
        )
        raise Exception(
            "Unsupported: Question is a slider question with non-integer answers."
        )

    # Use min-max range to get all possible choices for the slider
    slider_min = int(original_question.validation.min)
    slider_max = int(original_question.validation.max)

    # Convert original submitted answers to integers
    original_submitted_int_answers: List[int] = []
    for original_submitted_answer in original_submitted_answers:
        if original_submitted_answer[0].text:
            original_submitted_int_answers.append(
                int(original_submitted_answer[0].text)
            )

    df = pd.DataFrame(
        {"original_submitted_int_answers": original_submitted_int_answers}
    )

    s = df["original_submitted_int_answers"]

    # Divide submitted answers into equal width brackets between min and max
    divided_into_brackets_df = divide_into_brackets(
        s, NUMBER_OF_SIMULATED_CHOICES, slider_min, slider_max
    )

    # Inject the corresponding choices as if this was a multiple choice question
    question: Question = original_question.copy()
    choices: List[Choice] = []
    for row_index, bracket in divided_into_brackets_df.iterrows():
        choice_id = f"{original_question.id}:{row_index}"
        choice: Choice = Choice(
            id=choice_id,
            position=row_index,
            text=bracket["label"],
            visible=True,
        )
        choices.append(choice)
    question.answers = Answers(
        choices=choices,
    )

    # Inject the corresponding question rollup statistics
    rollup: QuestionRollup = original_rollup.copy()
    summary_item = rollup.summary[0].copy()
    choice_summaries: List[ChoiceSummary] = []
    for row_index, bracket in divided_into_brackets_df.iterrows():
        choice_id = f"{original_question.id}:{row_index}"
        choice_summary: ChoiceSummary = ChoiceSummary(
            id=choice_id,
            count=bracket["answer_counts"],
        )
        choice_summaries.append(choice_summary)
    summary_item.choices = choice_summaries
    rollup.summary[0] = summary_item

    return question, rollup


def divide_into_brackets(
    int_answers: pd.Series, num_brackets: int, min_value: int, max_value: int
) -> pd.DataFrame:
    """Divide the slider choices into a set of as-equal-as-possible slider values."""
    # Divide the slider values into n equal-sized bins using cut
    slider_values = pd.Series(data=range(min_value, max_value + 1))
    slider_bins = pd.cut(slider_values, num_brackets, labels=False, retbins=True)
    slider_bin_indices = slider_bins[0]
    slider_bins_min = slider_values.groupby(slider_bin_indices).apply(
        lambda x: min(list(x))
    )
    slider_bins_max = slider_values.groupby(slider_bin_indices).apply(
        lambda x: max(list(x))
    )
    slider_bins_df = pd.DataFrame(
        {
            "slider_bins_min": slider_bins_min,
            "slider_bins_max": slider_bins_max,
        }
    )
    slider_bins_df["slider_bins_label"] = (
        slider_bins_df["slider_bins_min"].astype(str)
        + "-"
        + slider_bins_df["slider_bins_max"].astype(str)
    )

    # Assign the series the bins, again using cut, but with the bin edges from above
    bins = pd.cut(int_answers, bins=slider_bins[1], labels=False, retbins=True)
    bin_indices = bins[0]

    # Use the bin indices to index the original series
    binned_int_answers = int_answers.groupby(bin_indices).apply(
        lambda x: sorted(list(x))
    )
    bin_min = int_answers.groupby(bin_indices).apply(lambda x: min(list(x)))
    bin_max = int_answers.groupby(bin_indices).apply(lambda x: max(list(x)))
    answer_counts = int_answers.groupby(bin_indices).apply(lambda x: len(x))

    df = pd.DataFrame(
        {
            "label": slider_bins_df["slider_bins_label"],
            "binned_int_answers": binned_int_answers,
            "bin_min": bin_min,
            "bin_max": bin_max,
            "answer_counts": answer_counts,
        }
    )
    return df
