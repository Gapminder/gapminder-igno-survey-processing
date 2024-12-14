from lib.app_singleton import app_logger
from lib.gs_combined.schemas import GsQuestionRow, GsSurveyResultsData
from lib.parsing.key_normalizer_for_slightly_fuzzy_lookups import (
    key_normalizer_for_slightly_fuzzy_lookups,
)
from lib.parsing.parse_survey_name import parse_survey_name


def map_question_id(
    survey_batch_number_attribute: str,
    question_text_attribute: str,
    question_id_attribute: str,
    gs_question_row: GsQuestionRow,
    gs_survey_results_data: GsSurveyResultsData,
) -> list[str]:
    if (
        gs_question_row.survey_name == "#N/A"
        or gs_question_row.survey_name == ""
        or gs_question_row.survey_name == "..."
    ):
        raise ValueError("(No survey name available)")

    survey_batch_number = parse_survey_name(gs_question_row.survey_name)[
        survey_batch_number_attribute
    ]
    if survey_batch_number is False:
        raise ValueError("n/a")
    if survey_batch_number is None:
        raise ValueError(
            f"(No {survey_batch_number_attribute} found in "
            f"survey name {gs_question_row.survey_name})"
        )

    fuzzy_question_text = key_normalizer_for_slightly_fuzzy_lookups(
        gs_question_row.question_text
    )

    igno_questions_df = gs_survey_results_data.imported_igno_questions_info.data.df
    matches = igno_questions_df.apply(
        lambda x: x[question_text_attribute]
        and key_normalizer_for_slightly_fuzzy_lookups(x[question_text_attribute])
        == fuzzy_question_text
        and x[survey_batch_number_attribute]
        and key_normalizer_for_slightly_fuzzy_lookups(x[survey_batch_number_attribute])
        == str(survey_batch_number),
        axis=1,
    )
    matching_imported_igno_questions_info_entries = igno_questions_df[matches]

    if len(matching_imported_igno_questions_info_entries) == 0:
        raise ValueError(
            f"(No questions found within {survey_batch_number_attribute}"
            f' {survey_batch_number}, fuzzy-searching for "{fuzzy_question_text}")'
        )

    rows = matching_imported_igno_questions_info_entries.iterrows()
    auto_mapped_ids = [
        imported_igno_questions_info_entry[question_id_attribute]
        for row_number, imported_igno_questions_info_entry in rows
    ]

    return auto_mapped_ids


def map_igno_index_question_id(
    gs_question_row: GsQuestionRow,
    gs_survey_results_data: GsSurveyResultsData,
) -> None:
    try:
        auto_mapped_ids = map_question_id(
            "igno_index_world_views_survey_batch_number",
            "igno_index_question",
            "igno_index_question_id",
            gs_question_row,
            gs_survey_results_data,
        )
        gs_question_row.auto_mapped_igno_index_question_id = "; ".join(auto_mapped_ids)
        if (
            len(auto_mapped_ids) == 1
            and gs_question_row.igno_index_question_id.strip() == ""
        ):
            gs_question_row.igno_index_question_id = (
                gs_question_row.auto_mapped_igno_index_question_id
            )
    except ValueError as e:
        gs_question_row.auto_mapped_igno_index_question_id = str(e)


def map_foreign_country_igno_question_id(
    gs_question_row: GsQuestionRow,
    gs_survey_results_data: GsSurveyResultsData,
) -> None:
    try:
        auto_mapped_ids = map_question_id(
            "country_views_survey_batch_number",
            "foreign_country_igno_question",
            "foreign_country_igno_question_id",
            gs_question_row,
            gs_survey_results_data,
        )
        gs_question_row.auto_mapped_foreign_country_igno_question_id = "; ".join(
            auto_mapped_ids
        )
        if (
            len(auto_mapped_ids) == 1
            and gs_question_row.foreign_country_igno_question_id.strip() == ""
        ):
            gs_question_row.foreign_country_igno_question_id = (
                gs_question_row.auto_mapped_foreign_country_igno_question_id
            )
    except ValueError as e:
        gs_question_row.auto_mapped_foreign_country_igno_question_id = str(e)


def map_step5_question_id(
    gs_question_row: GsQuestionRow,
    gs_survey_results_data: GsSurveyResultsData,
) -> None:
    try:
        auto_mapped_ids = map_question_id(
            "study_survey_batch_number",
            "step5_question",
            "step5_question_id",
            gs_question_row,
            gs_survey_results_data,
        )
        gs_question_row.auto_mapped_step5_question_id = "; ".join(auto_mapped_ids)
        if (
            len(auto_mapped_ids) == 1
            and gs_question_row.step5_question_id.strip() == ""
        ):
            gs_question_row.step5_question_id = (
                gs_question_row.auto_mapped_step5_question_id
            )
    except ValueError as e:
        gs_question_row.auto_mapped_step5_question_id = str(e)


def map_custom_igno_index_question_id(
    gs_question_row: GsQuestionRow,
    gs_survey_results_data: GsSurveyResultsData,
) -> None:
    try:
        auto_mapped_ids = map_question_id(
            "custom_igno_index_world_views_survey_batch_number",
            "custom_igno_index_question",
            "custom_igno_index_question_id",
            gs_question_row,
            gs_survey_results_data,
        )
        gs_question_row.auto_mapped_custom_igno_index_question_id = "; ".join(
            auto_mapped_ids
        )
        if (
            len(auto_mapped_ids) == 1
            and gs_question_row.custom_igno_index_question_id.strip() == ""
        ):
            gs_question_row.custom_igno_index_question_id = (
                gs_question_row.auto_mapped_custom_igno_index_question_id
            )
    except ValueError as e:
        gs_question_row.auto_mapped_custom_igno_index_question_id = str(e)
