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

# +
from lib.survey_monkey.api_client import fetch_survey_details

all_survey_details_by_survey_id = fetch_survey_details(sm_surveys_df['id'].to_list())
# -

all_survey_details_by_survey_id

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
# -

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

# +
from lib.gs_combined.spreadsheet import read_surveys_listing
surveys_worksheet_editor = read_surveys_listing(gs_combined_spreadsheet)
#print("surveys_worksheet_editor.data.df")
#display(surveys_worksheet_editor.data.df)

# appends rows med nya surveys som hittats i survey monkey, ifall inte redan appended till surveys sheet

def get_unlisted_surveys_df(sm_surveys_df, existing_df):
    sm_surveys_df = sm_surveys_df.copy()
    existing_df = existing_df.copy()
    sm_surveys_df["id"] = sm_surveys_df["id"].astype(str)
    existing_df["survey_id"] = existing_df["survey_id"].astype(str)
    merged_df = existing_df.merge(sm_surveys_df, how="outer", right_on="id", left_on="survey_id", indicator=True)
    unlisted_surveys_df = merged_df[merged_df["_merge"] == "right_only"]
    unlisted_surveys_df["id"] = unlisted_surveys_df["id"].astype(int)
    print("unlisted_surveys_df")
    display(unlisted_surveys_df)
    return unlisted_surveys_df

unlisted_surveys_df = get_unlisted_surveys_df(sm_surveys_df, surveys_worksheet_editor.data.df)
# -

unlisted_survey_ids = unlisted_surveys_df["id"].tolist()
unlisted_survey_ids

# +
from lib.survey_monkey.api_client import fetch_survey_details

unlisted_survey_details_by_survey_id = fetch_survey_details(unlisted_survey_ids)

# +
survey_rows_to_add = []
for index, survey_listing in unlisted_surveys_df.iterrows():
    print(index, survey_listing["title"])
    survey = unlisted_survey_details_by_survey_id[survey["id"]]
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

for survey_row in sorted(survey_rows_to_add, key=lambda d: d["survey_date"]):
    surveys_worksheet_editor.append_row(survey_row)
# -

surveys_worksheet_editor.data.df

# +
surveys_to_import_data_for = surveys_worksheet_editor.data.df[surveys_worksheet_editor.data.df["results_ready_for_import"].fillna(False).astype(bool) & ~surveys_worksheet_editor.data.df["results_imported"].fillna(False).astype(bool)]

if len(surveys_to_import_data_for) == 0:
    print("No surveys to import data for")
    survey_details_by_survey_id = None
else:
    survey_ids = surveys_to_import_data_for["survey_id"].tolist()
    print(survey_ids)
    survey_details_by_survey_id = fetch_survey_details(survey_ids)

# +
from lib.survey_monkey.api_client import fetch_question_rollups_by_question_id

question_rollups_by_question_id = fetch_question_rollups_by_question_id(survey_details_by_survey_id)
question_rollups_by_question_id

# +
import pandas as pd
from lib.mapping.convert_survey_details_to_gs_question_and_answer_rows import convert_survey_details_to_gs_question_and_answer_rows
from lib.gs_combined.schemas import GsSurveyResultsData

def import_gs_question_and_answer_rows(surveys_to_import_data_for: pd.DataFrame, gs_survey_results_data: GsSurveyResultsData):
    all_gs_questions = []
    all_gs_answers = []
    for index, survey_row in surveys_to_import_data_for.iterrows():
        try:
            survey_id = survey_row["survey_id"]
            survey_details = survey_details_by_survey_id[survey_id]
            gs_questions, gs_answers = convert_survey_details_to_gs_question_and_answer_rows(
                survey_details, 
                question_rollups_by_question_id,
                gs_survey_results_data,
            )
            #print(index)
            #display(gs_questions)
            #display(gs_answers)
        except Exception as error:
            print("error", type(error), error)
            raise error
        all_gs_questions = all_gs_questions + gs_questions
        all_gs_answers = all_gs_answers + gs_answers
    return all_gs_questions, all_gs_answers

gs_questions, gs_answers = import_gs_question_and_answer_rows(surveys_to_import_data_for, gs_survey_results_data)
# gs_questions, gs_answers

# +
# "Overview"
from dataclasses import asdict

gs_questions_df = pd.DataFrame(asdict(gs_question) for gs_question in gs_questions)
gs_questions_df

# +
# "Topline"
from dataclasses import asdict

gs_answers_df = pd.DataFrame(asdict(gs_answer) for gs_answer in gs_answers)
gs_answers_df

# +
from lib.gs_combined.schemas import attributes_to_columns_maps
from lib.gsheets.gsheets_worksheet_editor import GsheetsWorksheetEditor

gs_combined_dev_spreadsheet = authorized_clients.gc.open_by_key(
        "1Q6LG8SNLOLWFBeV0iEdN10cXTNyXJBerFJhYsdZ90uw"
    )

debug_gs_questions_df_editor = GsheetsWorksheetEditor(sh=gs_combined_dev_spreadsheet, worksheet_name="debug-gs_questions_df", header_row_number=0, attributes_to_columns_map=attributes_to_columns_maps["gs_combined"]["questions_combo"])
debug_gs_answers_df_editor = GsheetsWorksheetEditor(sh=gs_combined_dev_spreadsheet, worksheet_name="debug-gs_answers_df", header_row_number=0, attributes_to_columns_map=attributes_to_columns_maps["gs_combined"]["topline_combo"])

debug_gs_questions_df_editor.replace_data(gs_questions_df)
debug_gs_answers_df_editor.replace_data(gs_answers_df)
# -

# TODO: appends rows med nya questions och answer rader för dessa surveys
if False:
    gs_answer_rows_to_add = asdict(gs_answer) for gs_answer in gs_answers
    for gs_row in gs_answer_rows_to_add:
        debug_gs_answers_df_editor.append_row(gs_row)

# +
# TODO: markerar att surveys är importerade
# -


