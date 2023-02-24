import gspread_dataframe
import pandas as pd
from gspread import Spreadsheet, Worksheet

from lib.gsheets.gsheets_worksheet_data import GsheetsWorksheetData
from lib.gsheets.utils import get_worksheet


class GsheetsWorksheetEditor:
    sh: Spreadsheet
    data: GsheetsWorksheetData
    worksheet: Worksheet
    worksheet_name: str
    header_row_number: int
    attributes_to_columns_map: dict
    evaluate_formulas: bool
    remove_empty_rows: bool
    remove_empty_columns: bool

    def __init__(
        self,
        sh: Spreadsheet,
        worksheet_name: str,
        header_row_number: int,
        attributes_to_columns_map: dict,
        evaluate_formulas: bool = False,
        remove_empty_rows: bool = True,
        remove_empty_columns: bool = False,
    ):
        self.sh = sh
        self.worksheet_name = worksheet_name
        self.worksheet = get_worksheet(self.sh, self.worksheet_name)
        self.header_row_number = header_row_number
        self.attributes_to_columns_map = attributes_to_columns_map
        self.evaluate_formulas = evaluate_formulas
        self.remove_empty_rows = remove_empty_rows
        self.remove_empty_columns = remove_empty_columns
        self.load()

    def load(
        self,
    ) -> None:
        df = gspread_dataframe.get_as_dataframe(
            self.worksheet,
            header=self.header_row_number,
            evaluate_formulas=self.evaluate_formulas,
        )
        if self.remove_empty_rows:
            df = df.dropna(axis=0, how="all")
        if self.remove_empty_columns:
            df = df.dropna(axis=1, how="all")
        self.data = GsheetsWorksheetData(
            df=df,
            header_row_number=self.header_row_number,
            attributes_to_columns_map=self.attributes_to_columns_map,
        )

    def __repr__(self) -> str:
        return (
            f"{type(self).__name__} (sh.id={self.sh.id}, "
            f"worksheet_name={self.worksheet_name},"
            f" header_row_number={self.header_row_number})"
        )

    def append_row(self, row: dict) -> None:
        df_with_row = pd.DataFrame([row])
        self.append_data(df_with_row)

    def remove_row(self, df_row_index: int) -> None:
        start_index = df_row_index + self.data.header_row_number + 2
        self.worksheet.delete_rows(start_index)  # , end_index=None
        self.data.df = self.data.df.drop([df_row_index])

    def replace_data(self, df: pd.DataFrame) -> None:
        self.data.df = df
        export_df = self.data.export()
        gspread_dataframe.set_with_dataframe(self.worksheet, export_df, resize=True)

    def append_data(self, df: pd.DataFrame) -> None:
        new_df = pd.concat([self.data.df, df], ignore_index=True)
        self.data.df = new_df
        export_df = self.data.export()
        appended_rows_export_df = export_df.tail(len(df))
        gspread_dataframe.set_with_dataframe(
            self.worksheet,
            appended_rows_export_df,
            resize=False,
            row=self.worksheet.row_count + 1,
            include_column_header=False,
        )
