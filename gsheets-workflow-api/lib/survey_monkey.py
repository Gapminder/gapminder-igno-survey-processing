from typing import Any

import requests
from pandas import json_normalize

from lib.config import read_config
from lib.find_in_list import find_in_list


def sm_request(url: str) -> Any:
    config = read_config()

    payload: dict = {}
    headers = {
        "Content-Type": "application/json",
        "Authorization": f'bearer {config["SURVEY_MONKEY_API_TOKEN"]}',
    }

    return requests.request("GET", url, headers=headers, data=payload)


def fetch_surveys() -> Any:
    url = "https://api.surveymonkey.com/v3/surveys"
    response = sm_request(url)

    sm_surveys_df = json_normalize(response.json()["data"]).sort_values(by="id")
    return sm_surveys_df


def fetch_survey_details(survey_ids: list) -> Any:
    survey_details_by_survey_id = {}

    for survey_id in survey_ids:

        url = f"https://api.surveymonkey.com/v3/surveys/{survey_id}/details"
        response = sm_request(url)

        survey_details_by_survey_id[survey_id] = response.json()

    return survey_details_by_survey_id


def fetch_question_rollups_by_question_id(survey_details_by_survey_id: dict) -> Any:
    question_rollups_by_question_id = {}

    for survey_id, details in survey_details_by_survey_id.items():
        # print(survey_id)

        url = f"https://api.surveymonkey.com/v3/surveys/{survey_id}/rollups"
        response = sm_request(url)
        rollups = response.json()["data"]

        for page in details["pages"]:
            # print(page["id"])
            for question in page["questions"]:
                # print(question["id"])

                # page_id = page["id"]
                question_id = question["id"]

                rollup = find_in_list(rollups, "id", question_id)
                question_rollups_by_question_id[question_id] = rollup

    return question_rollups_by_question_id
