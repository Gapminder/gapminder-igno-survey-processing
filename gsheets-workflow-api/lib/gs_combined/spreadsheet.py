from gspread import Spreadsheet

from lib.gdrive.auth import AuthorizedClients
from lib.gs_combined.schemas import GsSurveyResultsData, attributes_to_columns_maps
from lib.gsheets.gsheets_worksheet_editor import GsheetsWorksheetEditor


def get_gs_combined_spreadsheet(
    authorized_clients: AuthorizedClients, gs_combined_spreadsheet_id: str
) -> Spreadsheet:
    gs_combined_spreadsheet = authorized_clients.gc.open_by_key(
        gs_combined_spreadsheet_id
    )
    return gs_combined_spreadsheet


def read_surveys_listing(
    gs_combined_spreadsheet: Spreadsheet,
) -> GsheetsWorksheetEditor:
    surveys = GsheetsWorksheetEditor(
        sh=gs_combined_spreadsheet,
        worksheet_name="surveys",
        header_row_number=0,
        attributes_to_columns_map=attributes_to_columns_maps["gs_combined"]["surveys"],
    )
    return surveys


def read_gs_survey_results_data(
    gs_combined_spreadsheet: Spreadsheet,
) -> GsSurveyResultsData:

    imported_igno_questions_info = GsheetsWorksheetEditor(
        sh=gs_combined_spreadsheet,
        worksheet_name="imported_igno_questions_info",
        header_row_number=1,
        attributes_to_columns_map=attributes_to_columns_maps["gs_combined"][
            "imported_igno_questions"
        ],
        evaluate_formulas=True,
    )
    questions_combo = GsheetsWorksheetEditor(
        sh=gs_combined_spreadsheet,
        worksheet_name="questions_combo",
        header_row_number=0,
        attributes_to_columns_map=attributes_to_columns_maps["gs_combined"][
            "questions_combo"
        ],
    )
    topline_combo = GsheetsWorksheetEditor(
        sh=gs_combined_spreadsheet,
        worksheet_name="topline_combo",
        header_row_number=0,
        attributes_to_columns_map=attributes_to_columns_maps["gs_combined"][
            "topline_combo"
        ],
    )
    return GsSurveyResultsData(
        imported_igno_questions_info=imported_igno_questions_info,
        questions_combo=questions_combo,
        topline_combo=topline_combo,
    )
