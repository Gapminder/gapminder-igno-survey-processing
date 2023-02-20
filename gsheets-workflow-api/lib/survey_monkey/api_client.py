import json
from typing import Any, Dict, List, Type, TypeVar

import requests
from pandas import json_normalize
from pydantic import ValidationError

from lib.config import read_config
from lib.survey_monkey.api_response_wrapper import GenericApiResponse
from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer, Response
from lib.survey_monkey.survey import Survey


def sm_request(url: str) -> Any:
    config = read_config()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f'bearer {config["SURVEY_MONKEY_API_TOKEN"]}',
    }

    return requests.request("GET", url, headers=headers, data=None)


def fetch_surveys() -> Any:
    url = "https://api.surveymonkey.com/v3/surveys"
    response = sm_request(url)

    sm_surveys_df = json_normalize(response.json()["data"]).sort_values(by="title")
    return sm_surveys_df


def fetch_survey_details(survey_ids: list) -> Dict[str, Survey]:
    survey_details_by_survey_id = {}

    for survey_id in survey_ids:

        url = f"https://api.surveymonkey.com/v3/surveys/{survey_id}/details"
        response = sm_request(url)
        response_json = response.json()

        try:
            survey_details = Survey(**response_json)
            survey_details_by_survey_id[survey_id] = survey_details
        except ValidationError as e:
            print(  # noqa T201
                f"ValidationError in survey with id {survey_id} and JSON:"
            )
            print(json.dumps(response_json, indent=2))  # noqa T201
            raise e

    return survey_details_by_survey_id


def fetch_question_rollups_by_question_id(
    survey_details_by_survey_id: Dict[str, Survey],
) -> Dict[str, QuestionRollup]:
    question_rollups_by_question_id: Dict[str, QuestionRollup] = {}

    for survey_id, survey in survey_details_by_survey_id.items():
        # print(survey_id)

        url = (
            f"https://api.surveymonkey.com/v3/surveys/{survey_id}/rollups?per_page=100"
        )
        response = sm_request(url)
        for rollup_payload in response.json()["data"]:
            rollup = QuestionRollup(**rollup_payload)
            question_rollups_by_question_id[rollup.id] = rollup

    return question_rollups_by_question_id


def fetch_submitted_answers_by_question_id(
    survey_details_by_survey_id: Dict[str, Survey],
) -> Dict[str, List[List[Answer]]]:
    submitted_answers_by_question_id: Dict[str, List[List[Answer]]] = {}
    for survey_id, survey in survey_details_by_survey_id.items():

        url = f"https://api.surveymonkey.com/v3/surveys/{survey_id}/responses/bulk?per_page=100"
        responses: List[Response] = paginate_through_all_response_pages(url, Response)

        for response in responses:
            for response_page in response.pages:
                for question in response_page.questions:
                    if question.id in submitted_answers_by_question_id:
                        submitted_answers_by_question_id[question.id].append(
                            question.answers
                        )
                    else:
                        submitted_answers_by_question_id[question.id] = [
                            question.answers
                        ]

    return submitted_answers_by_question_id


T = TypeVar("T")


def paginate_through_all_response_pages(url: str, model: Type[T]) -> List[T]:
    all_items: List[T] = []
    still_more_to_fetch = True
    while still_more_to_fetch:
        api_response: GenericApiResponse = GenericApiResponse(**sm_request(url).json())
        for item in api_response.data:
            all_items.append(model(**item))
        if api_response.links.next:
            url = api_response.links.next
        else:
            still_more_to_fetch = False
    return all_items
