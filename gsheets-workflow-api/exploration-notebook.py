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

# +
from lib.survey_monkey.api_client import fetch_surveys

sm_surveys_df = fetch_surveys()
sm_surveys_df
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

# ## The actual import routine to be cloudified

from lib.authorized_clients import get_service_account_authorized_clients
authorized_clients = get_service_account_authorized_clients()

from lib.gs_combined.spreadsheet import get_gs_combined_spreadsheet
gs_combined_spreadsheet = get_gs_combined_spreadsheet(authorized_clients)

# +
from lib.gs_combined.spreadsheet import read_gs_survey_results_data

gs_survey_results_data = read_gs_survey_results_data(gs_combined_spreadsheet)

"""
# TODO: maybe later not have to use importrange
"1bu_mQmytQkC8CUOwqzNJq4D_3nZiyHD0OTJvhaCcyuE"
#q_qID
"16pvka0dPw7_VR-hkOHOHqLeslDedfRFBU1WRY3kjym8"
#q_qID
"https://docs.google.com/spreadsheets/d/1B5nagphoKodR-lwCFsC9AvrnOylAK7Cj4apLuLW2RLw/edit"
#study_qID
"""
pass

display(gs_survey_results_data.imported_igno_questions_info.data.df.columns)
display(gs_survey_results_data.imported_igno_questions_info.data.df)
# -

from lib.gs_combined.spreadsheet import read_surveys_listing
surveys_worksheet_editor = read_surveys_listing(gs_combined_spreadsheet)
print("surveys_worksheet_editor.data.df")
display(surveys_worksheet_editor.data.df)

# Use DEV spreadsheet during development
if False:
    gs_combined_dev_spreadsheet = authorized_clients.gc.open_by_key(
        "1eafCGVMj2lUx-Q_FnrbttnZYUgRXcbVoudTRsqGHNY8"
    )
    gs_survey_results_data = read_gs_survey_results_data(gs_combined_dev_spreadsheet)
    surveys_worksheet_editor = read_surveys_listing(gs_combined_dev_spreadsheet)
    display(surveys_worksheet_editor.data.df)


# +
# appends rows with new surveys in survey monkey, if not already in the surveys sheet

def get_unlisted_surveys_df(sm_surveys_df, existing_df):
    sm_surveys_df = sm_surveys_df.copy()
    existing_df = existing_df.copy()
    sm_surveys_df["id"] = sm_surveys_df["id"].astype(str)
    existing_df["survey_id"] = existing_df["survey_id"].astype(str)
    merged_df = existing_df.merge(sm_surveys_df, how="outer", right_on="id", left_on="survey_id", indicator=True)
    unlisted_surveys_df = merged_df[merged_df["_merge"] == "right_only"].copy()
    unlisted_surveys_df["id"] = unlisted_surveys_df["id"].astype(int)
    return unlisted_surveys_df

unlisted_surveys_df = get_unlisted_surveys_df(sm_surveys_df, surveys_worksheet_editor.data.df)
unlisted_surveys_df
# -

unlisted_survey_ids = unlisted_surveys_df["id"].tolist()
unlisted_survey_ids

# +
from lib.survey_monkey.api_client import fetch_survey_details

unlisted_survey_details_by_survey_id = fetch_survey_details(unlisted_survey_ids)

# +
import pandas as pd

survey_rows_to_add = []
for index, survey_listing in unlisted_surveys_df.iterrows():
    print(index, survey_listing["title"])
    survey = unlisted_survey_details_by_survey_id[int(survey_listing["id"])]
    survey_row = {
        "survey_id": survey_listing["id"],
        "survey_name": survey_listing["title"],
        "link_to_results": survey_listing["href"],
        "sample_size": survey.response_count,
        "survey_date": survey.date_created,
        "rows_in_questions_combo": '=IF(J[[CURRENT_ROW]]="","",COUNTIF(questions_combo!$A$2:$A, J[[CURRENT_ROW]]))',
        "rows_in_topline_combo": '=IF(J[[CURRENT_ROW]]="","",COUNTIF(topline_combo!$A$2:$A, J[[CURRENT_ROW]]))',
    }
    survey_rows_to_add.append(survey_row)

survey_rows_to_add_df = pd.DataFrame(sorted(survey_rows_to_add, key=lambda d: d["survey_date"]))
survey_rows_to_add_df
# -

if len(survey_rows_to_add_df) > 0:
    surveys_worksheet_editor.append_data(survey_rows_to_add_df)
    survey_rows_to_add_df = []

# +
from lib.import_mechanics.prepare_import_of_gs_question_and_answer_rows import prepare_import_of_gs_question_and_answer_rows

surveys_to_import_data_for, survey_details_by_survey_id, question_rollups_by_question_id, submitted_answers_by_question_id = prepare_import_of_gs_question_and_answer_rows(
    surveys_worksheet_editor
)

# +
from lib.import_mechanics.import_gs_question_and_answer_rows import import_gs_question_and_answer_rows

gs_questions, gs_answers, surveys_fully_imported_df = import_gs_question_and_answer_rows(
    surveys_to_import_data_for,
    gs_survey_results_data,
    survey_details_by_survey_id,
    question_rollups_by_question_id,
    submitted_answers_by_question_id,
    surveys_worksheet_editor,
)

print(f"Found {len(gs_questions)} supported question rows and {len(gs_answers)} answer rows in the selected surveys")

surveys_fully_imported_df
# -


