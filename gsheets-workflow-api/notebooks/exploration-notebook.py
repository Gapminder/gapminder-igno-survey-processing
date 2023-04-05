# ---
# jupyter:
#   jupytext:
#     formats: ipynb,py:light
#     text_representation:
#       extension: .py
#       format_name: light
#       format_version: '1.5'
#       jupytext_version: 1.14.4
#   kernelspec:
#     display_name: gapminder-igno-survey-processing-gsheets-workflow-api
#     language: python
#     name: gapminder-igno-survey-processing-gsheets-workflow-api
# ---

# Makes edits in the included files available without restarting the kernel
# %reload_ext autoreload
# %autoreload 2

import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logging.debug("test")

# +
from lib.survey_monkey.api_client import fetch_surveys

sm_surveys_df = fetch_surveys()
sm_surveys_df
# -

# ## refresh_surveys_and_combined_listings

from lib.authorized_clients import get_service_account_authorized_clients
authorized_clients = get_service_account_authorized_clients()

# +
from lib.config import read_config

config = read_config()
gs_combined_spreadsheet_id = config["GS_COMBINED_SPREADSHEET_ID"]

# Uncomment to use DEV spreadsheet during development
# gs_combined_spreadsheet_id = config["GS_DEV_COMBINED_SPREADSHEET_ID"]

gs_combined_spreadsheet_id

# +
# %%time

from lib.import_mechanics.refresh_surveys_and_combined_listings import refresh_surveys_and_combined_listings

refresh_surveys_and_combined_listings(authorized_clients, gs_combined_spreadsheet_id)
# -
# ## Fetch all info about all surveys + misc

# +
from lib.survey_monkey.api_client import fetch_survey_details

all_survey_details_by_survey_id = fetch_survey_details(sm_surveys_df['id'].to_list())
# -

all_survey_details_by_survey_id

question_details_by_question_id = {}
for question_id, survey_details in all_survey_details_by_survey_id.items():
    for page in survey_details.pages:
        print(f"page {page.id}")  # noqa T201
        for question in page.questions:
            print(  # noqa T201
                f'question {question.id} "{question.headings[0].heading}"'
            )
            question_details_by_question_id[question.id] = question
question_details_by_question_id

# +
from dataclasses import asdict
import json
all_survey_details = []
for survey_id, survey in all_survey_details_by_survey_id.items():
    # print(survey_id, survey)
    all_survey_details.append(survey.dict())

print(json.dumps(all_survey_details))

# +
from lib.survey_monkey.api_client import fetch_question_rollups_by_question_id

all_question_rollups_by_question_id = fetch_question_rollups_by_question_id(all_survey_details_by_survey_id)
all_question_rollups_by_question_id

# +
import json
all_question_rollups = []
for id, question_rollup in all_question_rollups_by_question_id.items():
    all_question_rollups.append(question_rollup.dict())

print(json.dumps(all_question_rollups))

# +
from lib.survey_monkey.api_client import fetch_submitted_answers_by_question_id

all_submitted_answers_by_question_id = fetch_submitted_answers_by_question_id(all_survey_details_by_survey_id)
all_submitted_answers_by_question_id
# -

import pandas as pd
pd.set_option('display.max_rows', 1000)
pd.set_option('display.max_colwidth', 1000)

# find questions with answers that lack choices in rollup
choicify_question_test_cases_by_family = {
    'single_choice': [],
    'open_ended': [],
    'matrix': [],
}
for question_id, submitted_answers in all_submitted_answers_by_question_id.items():
    rollup = all_question_rollups_by_question_id[question_id]
    question = question_details_by_question_id[question_id]
    choicify_question_test_cases_by_family[rollup.family].append([question, rollup, submitted_answers])
choicify_question_test_cases_by_family['open_ended']

# +
from lib.mapping.choicify_question import choicify_question
from lib.mapping.utils import print_question_import_details

for test_case in choicify_question_test_cases_by_family['open_ended']:
    [question, rollup, submitted_answers] = test_case
    print("========")
    print(question.headings[0].heading)
    print_question_import_details(question, rollup, submitted_answers)
    actual = choicify_question(question, rollup, submitted_answers)
    print(actual)
# -



