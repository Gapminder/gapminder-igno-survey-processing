import re

import numpy as np
import pandas as pd

from lib.gsheets.utils import inv_dict


class GsheetsWorksheetData:
    row_number_placeholder_in_formulas = "[[CURRENT_ROW]]"
    df: pd.DataFrame
    header_row_number: int
    attributes_to_columns_map: dict

    def __init__(
        self,
        df: pd.DataFrame,
        header_row_number: int,
        attributes_to_columns_map: dict = {},
    ):
        self.header_row_number = header_row_number
        self.attributes_to_columns_map = attributes_to_columns_map
        renamed_df = df.rename(columns=inv_dict(attributes_to_columns_map))
        self.df = self.replace_current_row_numbers_in_formulas(renamed_df)

    def replace_current_row_numbers_in_formulas(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["__row_number"] = np.arange(len(df)) + self.header_row_number + 2

        def replace_current_row_numbers(row: dict) -> dict:
            for col_name in df.columns:
                if col_name == "__row_number":
                    continue
                value = row[col_name]
                if isinstance(value, str) and len(value) > 0 and value[0] == "=":
                    row[col_name] = re.sub(
                        r"([A-Z]+)" + str(row["__row_number"]),
                        r"\1" + self.row_number_placeholder_in_formulas,
                        value,
                    )
            return row

        df = df.apply(replace_current_row_numbers, axis=1)
        return df.drop(columns=["__row_number"])

    def restore_current_row_numbers_in_formulas(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["__row_number"] = np.arange(len(df)) + self.header_row_number + 2

        def restore_current_row_numbers(row: dict) -> dict:
            for col_name in self.df.columns:
                if col_name == "__row_number":
                    continue
                value = row[col_name]
                if isinstance(value, str) and len(value) > 0 and value[0] == "=":
                    row[col_name] = value.replace(
                        self.row_number_placeholder_in_formulas,
                        str(row["__row_number"]),
                    )
            return row

        df = df.apply(restore_current_row_numbers, axis=1)
        return df.drop(columns=["__row_number"])

    def export(self) -> pd.DataFrame:
        return self.restore_current_row_numbers_in_formulas(self.df).rename(
            columns=self.attributes_to_columns_map
        )
