from typing import List

from lib.parsing.answer_option_matches_factual_answer import (
    answer_option_matches_factual_answer,
)
from lib.parsing.extract_numerical_parts_of_answer_option import (
    extract_numerical_parts_of_answer_option,
)


def chosen_answer_option_is_this_many_answer_options_away_from_factual_answer(
    chosen_answer_option: str, answer_options: List[str], factual_answer: str
) -> int:
    chosen_answer_option = chosen_answer_option.strip().lower()
    factual_answer = factual_answer.strip().lower()

    if len(answer_options) == 0:
        raise ValueError("Empty answerOptions array given")

    if len(answer_options) == 1:
        raise ValueError("Only one answer option given")

    # Find correct answer options
    correct_answer_options = [
        ao
        for ao in answer_options
        if answer_option_matches_factual_answer(ao, factual_answer)
    ]
    if len(correct_answer_options) == 0:
        raise ValueError("No correct answer option found")

    # If the chosen answer option is a correct answer option, return 0
    if chosen_answer_option in correct_answer_options:
        return 0

    # Double-check that all answer options are numerical
    # (either integers, floats, percentages or ranges of such
    numerical_parts_of_answer_options = [
        extract_numerical_parts_of_answer_option(ao) for ao in answer_options
    ]
    numerical_answer_options = [
        npo for npo in numerical_parts_of_answer_options if len(npo) > 0
    ]
    if len(numerical_answer_options) != len(answer_options):
        raise ValueError("Answer options not all numerical")

    def minimum_numerical_part_of_answer_option(
        numerical_parts_of_answer_option: List[int],
    ) -> int:
        return min(numerical_parts_of_answer_option)

    # Order by min(numerics)
    sorted_minimums_of_numerical_parts_of_answer_options = sorted(
        minimum_numerical_part_of_answer_option(npo)
        for npo in numerical_parts_of_answer_options
    )

    # Compare with the other arguments
    minimum_of_numerical_parts_of_chosen_answer_option = (
        minimum_numerical_part_of_answer_option(
            extract_numerical_parts_of_answer_option(chosen_answer_option)
        )
    )

    minimums_of_numerical_parts_of_correct_answer_options = [
        minimum_numerical_part_of_answer_option(
            extract_numerical_parts_of_answer_option(ao)
        )
        for ao in correct_answer_options
    ]

    chosen_answer_option_is_this_many_answer_options_away_from_correct_answers = [
        abs(
            sorted_minimums_of_numerical_parts_of_answer_options.index(minpocao)
            - sorted_minimums_of_numerical_parts_of_answer_options.index(
                minimum_of_numerical_parts_of_chosen_answer_option
            )
        )
        for minpocao in minimums_of_numerical_parts_of_correct_answer_options
    ]

    return min(
        chosen_answer_option_is_this_many_answer_options_away_from_correct_answers
    )
