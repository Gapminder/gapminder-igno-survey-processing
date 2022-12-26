import pytest

from lib.parsing.extract_numerical_parts_of_answer_option import (
    extract_numerical_parts_of_answer_option,
)


@pytest.mark.parametrize(
    "answer_option, expected_output",
    [
        (False, []),
        (True, []),
        (None, []),
        (None, []),
        ("", []),
        (1, [1]),
        (1.1, [1.1]),
        ("1", [1]),
        ("1.1", [1.1]),
        ("1%", [1]),
        ("-1.1", [-1.1]),
        ("-1%", [-1]),
        ("1-1.1", [1, 1.1]),
        ("1-2%", [1, 2]),
        ("Abc", []),
        ("14 pounds", [14]),
        ("1000€", [1000]),
        ("$1", [1]),
        ("$14", [14]),
        ("$14 billion", [14]),
        ("About 10", [10]),
        ("Yes", []),
        ("30-40%", [30, 40]),
        ("20-30%", [20, 30]),
        ("More than 500", [500]),
        ("Less than 500", [500]),
        ("Between 300 and 700", [300]),
    ],
)
def test_extract_numerical_parts_of_answer_option(answer_option, expected_output):
    output = extract_numerical_parts_of_answer_option(answer_option)
    assert output == expected_output
