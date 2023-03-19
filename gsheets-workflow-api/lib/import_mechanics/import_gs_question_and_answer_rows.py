import json
import traceback
from dataclasses import asdict
from datetime import datetime
from typing import Dict, List, Tuple

import pandas as pd

from lib.gs_combined.schemas import GsAnswerRow, GsQuestionRow, GsSurveyResultsData
from lib.gsheets.gsheets_worksheet_editor import GsheetsWorksheetEditor
from lib.import_mechanics.utils import get_non_existing_rows_df
from lib.mapping.convert_survey_details_to_gs_question_and_answer_rows import (
    convert_survey_details_to_gs_question_and_answer_rows,
)
from lib.survey_monkey.question_rollup import QuestionRollup
from lib.survey_monkey.response import Answer
from lib.survey_monkey.survey import Survey


def import_gs_question_and_answer_rows(
    surveys_to_import_data_for: pd.DataFrame,
    gs_survey_results_data: GsSurveyResultsData,
    survey_details_by_survey_id: Dict[str, Survey],
    question_rollups_by_question_id: Dict[str, QuestionRollup],
    submitted_answers_by_question_id: Dict[str, List[List[Answer]]],
    surveys_worksheet_editor: GsheetsWorksheetEditor,
) -> Tuple[List[GsQuestionRow], List[GsAnswerRow], pd.DataFrame]:
    all_gs_questions: List[GsQuestionRow] = []
    all_gs_answers: List[GsAnswerRow] = []
    surveys_to_import_data_for = surveys_to_import_data_for.copy()
    surveys_to_import_data_for["survey_was_fully_imported"] = False
    for index, survey_row in surveys_to_import_data_for.iterrows():
        try:
            survey_id = survey_row["survey_id"]
            survey_details = survey_details_by_survey_id[survey_id]
            (
                gs_questions,
                gs_answers,
                ignored_questions,
            ) = convert_survey_details_to_gs_question_and_answer_rows(
                survey_details,
                question_rollups_by_question_id,
                submitted_answers_by_question_id,
                gs_survey_results_data,
            )

            # "Overview"
            gs_questions_df = pd.DataFrame(
                asdict(gs_question) for gs_question in gs_questions
            )
            unlisted_gs_questions_df = get_non_existing_rows_df(
                gs_questions_df,
                gs_survey_results_data.questions_combo.data.df,
                "survey_question_id",
            )

            # "Topline"
            gs_answers_df = pd.DataFrame(asdict(gs_answer) for gs_answer in gs_answers)
            unlisted_gs_answers_df = get_non_existing_rows_df(
                gs_answers_df,
                gs_survey_results_data.topline_combo.data.df,
                "survey_question_id",
            )

            # Append previously non-imported questions and
            # their answers to the respective spreadsheets
            if len(unlisted_gs_questions_df) > 0:
                print(  # noqa T201
                    f"Adding {len(unlisted_gs_questions_df)} yet "
                    f"unlisted questions to the spreadsheet"
                )
                gs_survey_results_data.questions_combo.append_data(
                    unlisted_gs_questions_df
                )
            else:
                print(f"No unlisted questions to add to the spreadsheet")  # noqa T201
            if len(unlisted_gs_answers_df) > 0:
                print(  # noqa T201
                    f"Adding {len(unlisted_gs_answers_df)} yet "
                    f"unlisted answers to the spreadsheet"
                )
                gs_survey_results_data.topline_combo.append_data(unlisted_gs_answers_df)
            else:
                print(f"No unlisted answers to add to the spreadsheet")  # noqa T201

            # Update import status
            if len(ignored_questions) == 0:
                surveys_to_import_data_for.loc[
                    index, "survey_was_fully_imported"
                ] = True
                # Mark survey as imported and update the import_timestamp
                surveys_worksheet_editor.update_a_cell(
                    index,
                    "results_imported",
                    True,
                )
                surveys_worksheet_editor.update_a_cell(
                    index,
                    "import_notes",
                    "Fully imported",
                )
                now = datetime.now()
                import_timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
                surveys_worksheet_editor.update_a_cell(
                    index,
                    "import_timestamp",
                    import_timestamp,
                )
            else:
                ignored_question_headings = []
                for ignored_question in ignored_questions:
                    first_heading = ignored_question.headings[0]
                    if first_heading:
                        ignored_question_headings.append(first_heading.dict())
                    else:
                        ignored_question_headings.append("(Undefined question text)")
                # Save warning to import_notes
                import_notes = (
                    f"Note: Survey with survey_id {survey_id} was not "
                    f"fully imported. Ignored questions: "
                    f"{json.dumps(ignored_question_headings)}"
                )
                surveys_worksheet_editor.update_a_cell(
                    index,
                    "import_notes",
                    import_notes,
                )
            all_gs_questions = all_gs_questions + gs_questions
            all_gs_answers = all_gs_answers + gs_answers
        except Exception as error:  # noqa B902
            error_string = f"Error occurred:\n\n{error}\n\n{traceback.format_exc()}\n"
            surveys_worksheet_editor.update_a_cell(
                index,
                "import_notes",
                error_string,
            )
    surveys_fully_imported_df = surveys_to_import_data_for[
        surveys_to_import_data_for["survey_was_fully_imported"]
    ]
    return all_gs_questions, all_gs_answers, surveys_fully_imported_df
