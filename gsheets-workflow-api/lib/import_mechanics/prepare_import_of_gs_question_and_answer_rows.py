from typing import Dict, List, Tuple

import pandas as pd

from lib.gsheets.gsheets_worksheet_editor import GsheetsWorksheetEditor
from lib.survey_monkey.api_client import (
    fetch_question_rollups_by_question_id,
    fetch_submitted_answers_by_question_id,
    fetch_survey_details,
    fetch_surveys,
)
from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Survey


class NoNewSurveys(Exception):
    pass


def prepare_import_of_gs_question_and_answer_rows(
    surveys_worksheet_editor: GsheetsWorksheetEditor, app_api_token: str
) -> Tuple[
    pd.DataFrame,
    Dict[str, Survey],
    Dict[str, QuestionRollup],
    Dict[str, List[List[Answer]]],
]:
    app_surveys = fetch_surveys(app_api_token)
    app_surveys_ids = app_surveys["id"].tolist()
    surveys_to_import_data_for = surveys_worksheet_editor.data.df[
        # surveys in this app...
        surveys_worksheet_editor.data.df["survey_id"].astype(str).isin(app_surveys_ids)
        # and ready for import...
        & surveys_worksheet_editor.data.df["results_ready_for_import"]
        .fillna(False)
        .astype(bool)
        # and not imported
        & ~surveys_worksheet_editor.data.df["results_imported"]
        .fillna(False)
        .astype(bool)
    ]

    if len(surveys_to_import_data_for) == 0:
        raise NoNewSurveys("No surveys to import data for")

    survey_ids = surveys_to_import_data_for["survey_id"].tolist()

    # Do all SurveyMonkey API calls up front
    survey_details_by_survey_id = fetch_survey_details(survey_ids, app_api_token)
    question_rollups_by_question_id = fetch_question_rollups_by_question_id(
        survey_details_by_survey_id, app_api_token
    )
    submitted_answers_by_question_id = fetch_submitted_answers_by_question_id(
        survey_details_by_survey_id, app_api_token
    )

    return (
        surveys_to_import_data_for,
        survey_details_by_survey_id,
        question_rollups_by_question_id,
        submitted_answers_by_question_id,
    )
