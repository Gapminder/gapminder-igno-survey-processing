from typing import List

import pytest

from lib.parsing.chosen_answer_option_is_this_many_answer_options_away_from_factual_answer import (
    chosen_answer_option_is_this_many_answer_options_away_from_factual_answer,
)


@pytest.mark.parametrize(
    "answer_option, answer_options, factual_answer, expected_output",
    [
        ("1", ["1", "2", "3"], "1", 0),
        ("1", ["1", "2", "3"], "2", 1),
        ("1", ["1", "2", "3"], "3", 2),
        ("2", ["1", "2", "3"], "1", 1),
        ("3", ["1", "2", "3"], "1", 2),
        ("10-20%", ["10-20%", "20-30%", "30-40%"], "15%", 0),
        ("10-20%", ["10-20%", "20-30%", "30-40%"], "25%", 1),
        ("10-20%", ["10-20%", "20-30%", "30-40%"], "35%", 2),
        ("20-30%", ["10-20%", "20-30%", "30-40%"], "15%", 1),
        ("30-40%", ["10-20%", "20-30%", "30-40%"], "15%", 2),
        ("20-30%", ["10-20%", "20-30%", "30-40%"], "30%", 0),
        ("10-20%", ["10-20%", "20-30%", "30-40%"], "30%", 1),
        ("30-40%", ["10-20%", "20-30%", "30-40%"], "30%", 0),
        ("7", ["1", "2", "3", "4", "5", "6", "7"], "1", 6),
        ("43%", ["3%", "23%", "43%"], "3%", 2),
        (
            "$50 billion",
            ["$10 billion", "$30 billion", "$50 billion"],
            "$10 billion",
            2,
        ),
    ],
)
def test_chosen_answer_option_is_this_many_answer_options_away(
    answer_option: str,
    answer_options: List[str],
    factual_answer: str,
    expected_output: int,
):
    output = chosen_answer_option_is_this_many_answer_options_away_from_factual_answer(
        answer_option, answer_options, factual_answer
    )
    assert output == expected_output
