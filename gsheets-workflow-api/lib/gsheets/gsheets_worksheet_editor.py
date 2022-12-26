import gspread_dataframe
import numpy as np
import pandas as pd
from gspread import Spreadsheet, Worksheet

from lib.gsheets.gsheets_worksheet_data import GsheetsWorksheetData
from lib.gsheets.utils import get_worksheet
from lib.utils import convert_df_cells_to_strings_with_max_length


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
        # display(df_with_row)
        new_df = pd.concat([self.data.df, df_with_row], ignore_index=True)
        # self.replace_data(new_df) <-- alt to below
        self.data.df = new_df
        export_df = convert_df_cells_to_strings_with_max_length(
            self.data.export().fillna(""), 1024
        )
        last_row_values_exported = export_df.iloc[-1, :].values.tolist()
        # print("last_row_values_exported", last_row_values_exported)
        serializable_values = []
        for value in last_row_values_exported:
            if type(value) == np.bool_:
                value = bool(value)
            serializable_values.append(value)
        self.worksheet.append_row(
            values=serializable_values, value_input_option="USER_ENTERED"
        )

    def remove_row(self, df_row_index: int) -> None:
        start_index = df_row_index + self.data.header_row_number + 2
        self.worksheet.delete_rows(start_index, end_index=None)
        self.data.df = self.data.df.drop([df_row_index])

    def replace_data(self, df: pd.DataFrame) -> None:
        self.data.df = df
        gspread_dataframe.set_with_dataframe(
            self.worksheet, self.data.export(), resize=True
        )

    # TODO: ability to update specific cells

    """

    foooo_worksheet = foo_spreadsheet.worksheet("sdkjlfsdflkj")
    foooo_all_rows = get_as_dataframe(foooo_worksheet, evaluate_formulas=True)
    foooo_all_rows

    foooo_columns = {
      "sdfsdf": "ref",
    }

    def update_foooo_worksheet(key, value, row_number, only_if_empty=True):
      return update_a_cell(foooo_worksheet, foooo_all_rows, inv_dict(foooo_columns),
      key, row_number, value, batch=True, only_if_empty=only_if_empty)

    foooo = foooo_all_rows.rename(columns=foooo_columns).dropna(
    subset=["geo_id"]
    )[foooo_columns.values()]
    foooo.tail(10)

    def send_spreadsheets_batch_requests(requests, spreadsheet_id):
      body = {'requests': requests}
      return sheets_service.spreadsheets().batchUpdate(
      spreadsheetId=spreadsheet_id, body=body
      ).execute()


    def update_a_cell(
      worksheet,
      original_worksheet_df,
      df_to_worksheet_column_name_map,
      df_column_name,
      row_number,
      value,
      batch=False,
      only_if_empty=False,
    ):
      import pandas as pd
      column_name = df_to_worksheet_column_name_map[df_column_name]
      dataframe_row_index = row_number-2

      # check the existing value
      existing_value = original_worksheet_df.at[dataframe_row_index, column_name]
      #print("existing_value", existing_value)

      if only_if_empty:
        empty = pd.isna(existing_value) or existing_value == ''
        #print("empty", empty)
        if not empty:
          return False

      # create the update request
      column_number = original_worksheet_df.columns.get_loc(column_name) + 1
      from gspread.utils import rowcol_to_a1

      range = rowcol_to_a1(row_number, column_number)
      if batch:
          return {"range": range, "values": [[value]]}
      results = worksheet.update_acell(range, value)

      # update the df as well so that it is up to date
      # TODO: find a way to support this properly support this in batch mode
      if not batch:
        original_worksheet_df.at[dataframe_row_index, column_name] = value

      return results
    """
