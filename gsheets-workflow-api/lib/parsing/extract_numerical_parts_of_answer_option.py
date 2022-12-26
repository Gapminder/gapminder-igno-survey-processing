import re
from typing import Any

from lib.parsing.key_normalizer_for_slightly_fuzzy_lookups import (
    key_normalizer_for_slightly_fuzzy_lookups,
)


def is_numeric(n: Any) -> bool:
    # support "1," interpreted as 1.0, like parseFloat in js does
    sanitized_n = re.sub(r",$", "", n)
    # print("sanitized_n", sanitized_n)
    try:
        float(sanitized_n)
        return True
    except ValueError:
        return False


def extract_numerical_parts_of_answer_option(answer_option: str) -> list:
    answer_option = key_normalizer_for_slightly_fuzzy_lookups(
        str(answer_option).strip().lower()
    )

    if is_numeric(answer_option):
        return [float(answer_option)]

    # If has a "-" sign somewhere not in the beginning,
    # it may be a range and we try both sides of the range
    if "-" in answer_option[1:]:
        range_parts = answer_option.split("-")
        if len(range_parts) > 2:
            return []
        if extract_numerical_parts_of_answer_option(
            range_parts[0]
        ) and extract_numerical_parts_of_answer_option(range_parts[1]):
            return extract_numerical_parts_of_answer_option(
                range_parts[0]
            ) + extract_numerical_parts_of_answer_option(range_parts[1])

    # Look for numeric contents in the string
    # ("1%", "1000€", "14 pounds, "$1", "About 10", "$1 billion" etc)
    numeric_regex = r"-?\d[\d.,]*"
    numeric_match_result = re.search(numeric_regex, answer_option)
    if numeric_match_result:
        return (
            [float(numeric_match_result.group(0))]
            if is_numeric(numeric_match_result.group(0))
            else []
        )

    return []
