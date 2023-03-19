import pandas as pd

from lib.gdrive.auth import AuthorizedClients
from lib.gs_combined.spreadsheet import (
    get_gs_combined_spreadsheet,
    read_gs_survey_results_data,
    read_surveys_listing,
)
from lib.import_mechanics.import_gs_question_and_answer_rows import (
    import_gs_question_and_answer_rows,
)
from lib.import_mechanics.prepare_import_of_gs_question_and_answer_rows import (
    prepare_import_of_gs_question_and_answer_rows,
)
from lib.import_mechanics.utils import get_non_existing_rows_df
from lib.survey_monkey.api_client import fetch_survey_details, fetch_surveys


def refresh_surveys_and_combined_listings(
    authorized_clients: AuthorizedClients, gs_combined_spreadsheet_id: str
) -> None:

    sm_surveys_df = fetch_surveys()

    gs_combined_spreadsheet = get_gs_combined_spreadsheet(
        authorized_clients, gs_combined_spreadsheet_id
    )
    gs_survey_results_data = read_gs_survey_results_data(gs_combined_spreadsheet)

    surveys_worksheet_editor = read_surveys_listing(gs_combined_spreadsheet)

    # appends rows with new surveys in survey monkey, if not already in the surveys sheet
    sm_surveys_df["survey_id"] = sm_surveys_df["id"]
    unlisted_surveys_df = get_non_existing_rows_df(
        sm_surveys_df,
        surveys_worksheet_editor.data.df,
        "survey_id",
    )

    unlisted_survey_ids = unlisted_surveys_df["id"].tolist()

    unlisted_survey_details_by_survey_id = fetch_survey_details(unlisted_survey_ids)

    survey_rows_to_add = []
    for index, survey_listing in unlisted_surveys_df.iterrows():
        print(index, survey_listing["title"])  # noqa T201
        survey = unlisted_survey_details_by_survey_id[survey_listing["id"]]
        survey_row = {
            "survey_id": survey_listing["id"],
            "survey_name": survey_listing["title"],
            "link_to_results": survey_listing["href"],
            "sample_size": survey.response_count,
            "survey_date": survey.date_created,
            "rows_in_questions_combo": '=IF(J[[CURRENT_ROW]]="","",'
            "COUNTIF(questions_combo!$A$2:$A, J[[CURRENT_ROW]]))",
            "rows_in_topline_combo": '=IF(J[[CURRENT_ROW]]="","",'
            "COUNTIF(topline_combo!$A$2:$A, J[[CURRENT_ROW]]))",
        }
        survey_rows_to_add.append(survey_row)

    survey_rows_to_add_df = pd.DataFrame(
        sorted(survey_rows_to_add, key=lambda d: d["survey_date"])
    )

    if len(survey_rows_to_add_df) > 0:
        surveys_worksheet_editor.append_data(survey_rows_to_add_df)

    (
        surveys_to_import_data_for,
        survey_details_by_survey_id,
        question_rollups_by_question_id,
        submitted_answers_by_question_id,
    ) = prepare_import_of_gs_question_and_answer_rows(surveys_worksheet_editor)

    (
        gs_questions,
        gs_answers,
        surveys_fully_imported_df,
    ) = import_gs_question_and_answer_rows(
        surveys_to_import_data_for,
        gs_survey_results_data,
        survey_details_by_survey_id,
        question_rollups_by_question_id,
        submitted_answers_by_question_id,
        surveys_worksheet_editor,
    )

    print(  # noqa T201
        f"Found {len(gs_questions)} supported question rows "
        f"and {len(gs_answers)} answer rows in the selected surveys"
    )

    pass
