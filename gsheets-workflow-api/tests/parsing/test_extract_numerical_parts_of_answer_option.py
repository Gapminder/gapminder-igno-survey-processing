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
        ("1%", [0.01]),
        ("-1.1", [-1.1]),
        ("-1%", [-0.01]),
        ("1-1.1", [1, 1.1]),
        ("1-2%", [0.01, 0.02]),
        ("Abc", []),
        ("14 pounds", [14]),
        ("1000€", [1000]),
        ("$1", [1]),
        ("$14", [14]),
        ("$14 billion", [14]),
        ("About 10", [10]),
        ("Yes", []),
        ("30-40%", [0.3, 0.4]),
        ("20-30%", [0.2, 0.3]),
        ("More than 500", [500]),
        ("Less than 500", [500]),
        ("Between 300 and 700", [300]),
    ],
)
def test_extract_numerical_parts_of_answer_option(answer_option, expected_output):
    output = extract_numerical_parts_of_answer_option(answer_option)
    assert output == expected_output
