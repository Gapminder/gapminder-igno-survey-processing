import pandas as pd


def get_non_existing_rows_df(
    new_df: pd.DataFrame, existing_df: pd.DataFrame, unique_id_attribute: str
) -> pd.DataFrame:
    new_df["_merge_id"] = new_df[unique_id_attribute].dropna().astype(int).astype(str)
    existing_df["_merge_id"] = (
        existing_df[unique_id_attribute].dropna().astype(int).astype(str)
    )
    merged_df = pd.merge(
        new_df,
        existing_df,
        on=["_merge_id"],
        how="outer",
        indicator=True,
        suffixes=("", "_existing"),
    )
    return merged_df.loc[merged_df["_merge"] == "left_only", new_df.columns].drop(
        columns=["_merge_id"]
    )
