from __future__ import annotations

import os

from dotenv import load_dotenv


def read_config() -> dict[str, str]:
    load_dotenv()

    config = {}
    # Mandatory configuration
    for key in [
        "SURVEY_MONKEY_API_TOKEN",
    ]:
        config[key] = os.getenv(key=key, default="")
        if config[key] == "":
            raise Exception(f"The mandatory environment variable {key} is empty")
    # Optional configuration
    for key in [
        "SERVICE_ACCOUNT_CREDENTIALS",
        "GS_COMBINED_SPREADSHEET_ID",
        "GS_DEV_COMBINED_SPREADSHEET_ID",
    ]:
        config[key] = os.getenv(key=key, default="")
    return config
