import json

import functions_framework
from flask import Request
from flask.typing import ResponseReturnValue

from lib.gdrive.auth import authorize, authorized_user_credentials
from lib.import_mechanics.refresh_surveys_and_combined_listings import (
    refresh_surveys_and_combined_listings as _refresh_surveys_and_combined_listings,
)


@functions_framework.http
def refresh_surveys_and_combined_listings(request: Request) -> ResponseReturnValue:

    body = request.json
    access_token = body["accessToken"]
    survey_results_gsheet_id = body["spreadsheetId"]

    credentials = authorized_user_credentials(access_token)
    authorized_clients = authorize(credentials)

    _refresh_surveys_and_combined_listings(authorized_clients, survey_results_gsheet_id)

    return (
        json.dumps({"status": "ok"}),
        200,
        {"Content-Type": "application/json"},
    )
