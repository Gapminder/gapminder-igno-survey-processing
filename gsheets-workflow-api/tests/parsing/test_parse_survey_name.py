from typing import Any, Dict

import pytest

from lib.parsing.parse_survey_name import parse_survey_name


@pytest.mark.parametrize(
    "survey_name,expected_output",
    [
        (
            "World Views 123",
            {
                "igno_index_world_views_survey_batch_number": "123",
                "country_views_survey_batch_number": False,
                "study_survey_batch_number": False,
            },
        ),
        (
            "Country Views 123",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": "123",
                "study_survey_batch_number": False,
            },
        ),
        (
            "Study Survey 123",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": False,
                "study_survey_batch_number": "123",
            },
        ),
        (
            "Foo 123",
            {
                "igno_index_world_views_survey_batch_number": None,
                "country_views_survey_batch_number": None,
                "study_survey_batch_number": None,
            },
        ),
        (
            "#N/A",
            {
                "igno_index_world_views_survey_batch_number": None,
                "country_views_survey_batch_number": None,
                "study_survey_batch_number": None,
            },
        ),
        (
            "Country Views 383",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": "383",
                "study_survey_batch_number": "1/c383",
            },
        ),
        (
            "Country Views 384",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": "384",
                "study_survey_batch_number": "2/c384",
            },
        ),
        (
            "Country Views 385",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": "385",
                "study_survey_batch_number": "3/c385",
            },
        ),
        (
            "Study 123",
            {
                "igno_index_world_views_survey_batch_number": False,
                "country_views_survey_batch_number": False,
                "study_survey_batch_number": "123",
            },
        ),
        (
            "World Views 1",
            {
                "igno_index_world_views_survey_batch_number": "1-80",
                "country_views_survey_batch_number": False,
                "study_survey_batch_number": False,
            },
        ),
        (
            "World Views 80",
            {
                "igno_index_world_views_survey_batch_number": "1-80",
                "country_views_survey_batch_number": False,
                "study_survey_batch_number": False,
            },
        ),
    ],
)
def test_parse_survey_name(survey_name: str, expected_output: Dict[str, Any]) -> None:
    output = parse_survey_name(survey_name)
    assert output == expected_output
