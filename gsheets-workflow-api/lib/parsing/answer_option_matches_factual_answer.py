from lib.parsing.extract_numerical_parts_of_answer_option import (
    extract_numerical_parts_of_answer_option,
)
from lib.parsing.key_normalizer_for_slightly_fuzzy_lookups import (
    key_normalizer_for_slightly_fuzzy_lookups,
)


def answer_option_matches_factual_answer(
    answer_option: str, factual_answer: str
) -> bool:
    return answer_option_is_the_same_as_factual_answer(
        answer_option, factual_answer
    ) or answer_option_matches_factual_answer_numerically(answer_option, factual_answer)


def answer_option_is_the_same_as_factual_answer(
    answer_option: str, factual_answer: str
) -> bool:
    answer_option = key_normalizer_for_slightly_fuzzy_lookups(answer_option)
    factual_answer = key_normalizer_for_slightly_fuzzy_lookups(factual_answer)
    if answer_option == factual_answer:
        return True
    return False


def answer_option_matches_factual_answer_numerically(
    answer_option: str, factual_answer: str
) -> bool:
    # Support matching eg "14" to "14 pounds"
    numerical_parts_of_answer_option = extract_numerical_parts_of_answer_option(
        answer_option
    )
    numerical_parts_of_factual_answer = extract_numerical_parts_of_answer_option(
        factual_answer
    )
    if (
        len(numerical_parts_of_answer_option) > 0
        and len(numerical_parts_of_factual_answer) > 0
    ):
        factual_answer_numeric = numerical_parts_of_factual_answer[0]
        if len(numerical_parts_of_answer_option) == 1:
            answer_option_numeric = numerical_parts_of_answer_option[0]
            return factual_answer_numeric == answer_option_numeric
        if len(numerical_parts_of_answer_option) == 2:
            # Support matching eg "34%" to "30-40%"
            if (
                numerical_parts_of_answer_option[0] <= factual_answer_numeric
                and numerical_parts_of_answer_option[1] >= factual_answer_numeric
            ):
                return True
    return False
