from typing import Dict, Union

from lib.parsing.extract_numerical_parts_of_answer_option import (
    extract_numerical_parts_of_answer_option
)

BatchNumberParseResult = Union[str, None, bool]


def parse_survey_name(survey_name: str) -> Dict[str, BatchNumberParseResult]:
    world_views_text_found = (
        "World Views " in survey_name or "Worldviews " in survey_name
    )
    country_views_text_found = "Country Views " in survey_name
    study_survey_text_found = "Study Survey " in survey_name or "Study " in survey_name

    numerical_parts_of_survey_name = extract_numerical_parts_of_answer_option(
        survey_name
    )
    world_views_survey_batch_number: BatchNumberParseResult = (
        str(int(numerical_parts_of_survey_name[0])) if world_views_text_found else False
    )
    country_views_survey_batch_number: BatchNumberParseResult = (
        str(int(numerical_parts_of_survey_name[0]))
        if country_views_text_found
        else False
    )
    study_survey_batch_number: BatchNumberParseResult = (
        str(int(numerical_parts_of_survey_name[0]))
        if study_survey_text_found
        else False
    )

    # Some special cases
    if country_views_survey_batch_number == "383":
        study_survey_batch_number = "1/c383"
    if country_views_survey_batch_number == "384":
        study_survey_batch_number = "2/c384"
    if country_views_survey_batch_number == "385":
        study_survey_batch_number = "3/c385"
    if world_views_survey_batch_number:
        n = int(world_views_survey_batch_number)
        if 0 < n < 81:
            world_views_survey_batch_number = "1-80"

    # Return nulls in case nothing was found at all
    if (
        world_views_survey_batch_number is False
        and country_views_survey_batch_number is False
        and study_survey_batch_number is False
    ):
        world_views_survey_batch_number = None
        country_views_survey_batch_number = None
        study_survey_batch_number = None

    # Just use None for Custom igno index
    custom_igno_index_world_views_survey_batch_number = None

    return {
        "igno_index_world_views_survey_batch_number": world_views_survey_batch_number,
        "country_views_survey_batch_number": country_views_survey_batch_number,
        "study_survey_batch_number": study_survey_batch_number,
        "custom_igno_index_world_views_survey_batch_number": custom_igno_index_world_views_survey_batch_number,
    }
