import pytest

from lib.parsing.extract_numerical_parts_of_answer_option import (
    extract_numerical_parts_of_answer_option,
    is_numeric,
)


@pytest.mark.parametrize(
    "n, expected_output",
    [
        ("1", True),
        ("1.0", True),
        ("1.", True),
        ("1,0", True),
        ("1,", True),
        ("150,000", True),
        ("150,000.00", True),
        ("150,000.00%", False),
        ("abc%", False),
    ],
)
def test_is_numeric(n, expected_output):
    output = is_numeric(n)
    assert output == expected_output


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
        ("Around 150,000", [150000]),
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
