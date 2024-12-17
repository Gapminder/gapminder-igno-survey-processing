from typing import Any

import pandas as pd

from lib.parsing.extract_numerical_parts_of_answer_option import is_numeric


def stringify_id(id: Any) -> str:
    if is_numeric(id):
        return str(int(id))
    return str(id)


def get_non_existing_rows_df(
    new_df: pd.DataFrame, existing_df: pd.DataFrame, unique_id_attribute: str
) -> pd.DataFrame:
    new_df["_merge_id"] = new_df[unique_id_attribute].dropna().apply(stringify_id)
    existing_df["_merge_id"] = (
        existing_df[unique_id_attribute].dropna().apply(stringify_id)
    )
    if not existing_df["_merge_id"].dropna().empty:
        merged_df = pd.merge(
            new_df,
            existing_df,
            on=["_merge_id"],
            how="outer",
            indicator=True,
            suffixes=("", "_existing"),
        )
        res = merged_df.loc[merged_df["_merge"] == "left_only", new_df.columns].drop(
            columns=["_merge_id"]
        )
    else:
        res = new_df.drop(columns=["_merge_id"])
    return res
