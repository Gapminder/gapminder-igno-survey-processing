import pytest

from lib.parsing.answer_option_matches_factual_answer import (
    answer_option_matches_factual_answer,
)


@pytest.mark.parametrize(
    "answer_option, factual_answer, expected_output",
    [
        ("1%", "1%", True),
        ("1%", "1% ", True),
        ("1%", "1%,", True),
        ("1%,", "1%", True),
        ('1%"', "1%", True),
        ("1%", "0.01", True),
        ("1%", "0.02", False),
        ("10%", '0.1"', True),
        ("100%", '1"', True),
        ("30-40%", "24%", False),
        ("30-40%", "34%", True),
        ("30-40%", "44%", False),
        ("30-40%", "30%", True),
        ("30-40%", "40%", True),
        ("30-40%", "20%", False),
        ("20-30%", "30%", True),
        ("20-30%", "30.0%", True),
        ("20-30%", "29.9%", True),
        ("14 pounds", "14", True),
        ("14", "14 pounds", True),
        ("15", "14 pounds", False),
    ],
)
def test_answer_option_matches_factual_answer(
    answer_option, factual_answer, expected_output
):
    output = answer_option_matches_factual_answer(answer_option, factual_answer)
    assert output == expected_output
