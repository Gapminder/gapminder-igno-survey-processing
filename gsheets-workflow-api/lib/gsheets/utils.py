from __future__ import annotations

import pandas as pd
from gspread import Spreadsheet, Worksheet, WorksheetNotFound
from gspread_dataframe import set_with_dataframe


def spreadsheet_url(spreadsheet_id: str) -> str:
    return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"


def save_df_to_worksheet(
    sh: Spreadsheet, worksheet_name: str, df: pd.DataFrame
) -> None:
    worksheet = get_worksheet(sh, worksheet_name, True)

    set_with_dataframe(worksheet, df, resize=True)


def get_worksheet(
    sh: Spreadsheet, worksheet_name: str, create_if_not_exists: bool = False
) -> Worksheet:
    try:
        worksheet = sh.worksheet(worksheet_name)
        print(  # noqa T201
            f'Retrieved worksheet "{worksheet_name}" from '
            f"spreadsheet with URL: {spreadsheet_url(sh.id)}"
        )
    except WorksheetNotFound as e:
        if create_if_not_exists:
            worksheet = sh.add_worksheet(title=worksheet_name, rows=1, cols=1)
            print(  # noqa T201
                f'Added worksheet "{worksheet_name}" to '
                f"spreadsheet with URL: {spreadsheet_url(sh.id)}"
            )
        else:
            raise e
    return worksheet
