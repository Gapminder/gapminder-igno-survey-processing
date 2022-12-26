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


def extract_numerical_parts_of_answer_option(answer_option: str) -> list[float]:
    answer_option = key_normalizer_for_slightly_fuzzy_lookups(
        str(answer_option).strip().lower()
    )

    if is_numeric(answer_option):
        return [float(answer_option)]

    # Look for numeric contents in the string
    # ("1%", "1000€", "14 pounds, "$1", "About 10", "$1 billion" etc)
    numeric_regex = r"(-?\d[\d.,]*)(%)?(-(\d[\d.,]*)(%)?)?"
    numeric_match_result = re.search(numeric_regex, answer_option)
    if numeric_match_result:
        first_part_number = numeric_match_result.group(1)
        first_part_is_percentage = numeric_match_result.group(2) == "%"
        # It may be a range and we try both sides of the range
        second_part_number = numeric_match_result.group(4)
        second_part_is_percentage = numeric_match_result.group(5) == "%"
        # A percentage at the end makes both parts a percentage (e.g. 12-15%)
        if second_part_number is not None:
            if second_part_is_percentage:
                first_part_is_percentage = True
        first_part = None
        if is_numeric(first_part_number):
            if first_part_is_percentage:
                first_part = float(first_part_number) / 100
            else:
                first_part = float(first_part_number)
        if not second_part_number:
            return [first_part]
        else:
            second_part = None
            if is_numeric(second_part_number):
                if second_part_is_percentage:
                    second_part = float(second_part_number) / 100
                else:
                    second_part = float(second_part_number)
            return [first_part, second_part]
    return []
