from json import dumps

import pandas as pd

from lib.gsheets.gsheets_worksheet_data import GsheetsWorksheetData


def test_gsheets_worksheet_data() -> None:
    original_df = pd.DataFrame(
        [
            {"Foo": "=C$2:C2", "bar": "Cat", "bool": False},
            {"Foo": "=C$2:C3", "bar": "Mouse", "bool": False},
            {"Foo": "=C$2:C2", "bar": "Dog", "bool": True},
            {"Foo": "=C$2:C5", "bar": "Eagle", "bool": True},
            {"Foo": "C$2:C6", "bar": "Albatross", "bool": False},
            {"Foo": "", "bar": "Albatross", "bool": False},
        ]
    )

    internal_df = pd.DataFrame(
        [
            {"foo": "=C$2:C[[CURRENT_ROW]]", "bar": "Cat", "bool": False},
            {"foo": "=C$2:C[[CURRENT_ROW]]", "bar": "Mouse", "bool": False},
            {"foo": "=C$2:C2", "bar": "Dog", "bool": True},
            {"foo": "=C$2:C[[CURRENT_ROW]]", "bar": "Eagle", "bool": True},
            {"foo": "C$2:C6", "bar": "Albatross", "bool": False},
            {"foo": "", "bar": "Albatross", "bool": False},
        ]
    )

    data = GsheetsWorksheetData(
        original_df, header_row_number=0, attributes_to_columns_map={"foo": "Foo"}
    )
    actual = dumps(data.df.to_json(orient="records"), indent=2)
    expected = dumps(internal_df.to_json(orient="records"), indent=2)
    assert actual == expected

    actual = dumps(data.export().to_json(orient="records"), indent=2)
    expected = dumps(original_df.to_json(orient="records"), indent=2)
    assert actual == expected
