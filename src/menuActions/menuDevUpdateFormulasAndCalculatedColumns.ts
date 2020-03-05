import { chunk } from "lodash";
import groupBy from "lodash/groupBy";
import { combinedQuestionsSheetValueRowToCombinedQuestionEntry } from "../gsheetsData/combinedQuestionsSheet";
import { combinedToplineSheetValueRowToCombinedToplineEntry } from "../gsheetsData/combinedToplineSheet";
import {
  GsDashboardSurveyListingsEntry,
  gsDashboardSurveyListingsSheetValueRowToGsDashboardSurveyListingsEntry
} from "../gsheetsData/gsDashboardSurveyListingsSheet";
import { importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry } from "../gsheetsData/importedIgnoQuestionsInfoSheet";
import { surveysSheetValueRowToSurveyEntry } from "../gsheetsData/surveysSheet";
import {
  fetchAndVerifyCombinedQuestionsSheet,
  fetchAndVerifyCombinedToplineSheet,
  fetchAndVerifyGsDashboardSurveyListingsSheet,
  fetchAndVerifyImportedIgnoQuestionsInfoSheet,
  fetchAndVerifySurveysSheet,
  updateCombinedQuestionSheetFormulasAndCalculatedColumns,
  updateCombinedToplineSheetFormulasAndCalculatedColumns,
  updateSurveysSheetFormulasAndCalculatedColumns
} from "./common";

/**
 * Menu item action for "Gapminder Igno Survey Process -> (For developer use only) Update formulas and calculated columns"
 */
export function menuDevUpdateFormulasAndCalculatedColumns() {
  try {
    devUpdateFormulasAndCalculatedColumns();
    SpreadsheetApp.getUi().alert(`Updated formulas and calculated columns`);
  } catch (e) {
    // Make sure that the error ends up in the logs, regardless of if the user sees the error or not
    /* tslint:disable:no-console */
    console.error(e);
    /* tslint:enable:no-console */
    // Ignore "Timed out waiting for user response" since it just means that we let the script run and went for coffee
    if (e.message === "Timed out waiting for user response") {
      return;
    }
    // Friendly error notice
    SpreadsheetApp.getUi().alert(
      "Encountered an issue: \n\n" + e.message + "\n\n" + e.stack
    );
    // Also throw the error so that it is clear that there was an error
    throw e;
  }

  return;
}

/**
 * @hidden
 */
function devUpdateFormulasAndCalculatedColumns() {
  /* tslint:disable:no-console */
  console.info(`Start of devUpdateFormulasAndCalculatedColumns()`);

  console.info(`Fetching and verifying existing worksheets`);
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const {
    surveysSheet,
    surveysSheetValuesIncludingHeaderRow
  } = fetchAndVerifySurveysSheet(activeSpreadsheet);
  const {
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedQuestionsSheet(activeSpreadsheet);
  const {
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedToplineSheet(activeSpreadsheet);
  const {
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  } = fetchAndVerifyImportedIgnoQuestionsInfoSheet(activeSpreadsheet);
  const {
    gsDashboardSurveyListingsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyGsDashboardSurveyListingsSheet(activeSpreadsheet);

  const surveysSheetValues = surveysSheetValuesIncludingHeaderRow.slice(1);
  const surveyEntries = surveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );

  const combinedQuestionsSheetValues = combinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const combinedQuestionEntries = combinedQuestionsSheetValues.map(
    combinedQuestionsSheetValueRowToCombinedQuestionEntry
  );

  const combinedToplineSheetValues = combinedToplineSheetValuesIncludingHeaderRow.slice(
    1
  );
  const combinedToplineEntries = combinedToplineSheetValues.map(
    combinedToplineSheetValueRowToCombinedToplineEntry
  );

  const gsDashboardSurveyListingsSheetValues = gsDashboardSurveyListingsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const gsDashboardSurveyListingsEntries = gsDashboardSurveyListingsSheetValues.map(
    gsDashboardSurveyListingsSheetValueRowToGsDashboardSurveyListingsEntry
  );

  const importedIgnoQuestionsInfoSheetValues = importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow.slice(
    1
  );
  const importedIgnoQuestionsInfoEntries = importedIgnoQuestionsInfoSheetValues.map(
    importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry
  );

  const gsDashboardSurveyListingsEntriesBySurveyId = groupBy(
    gsDashboardSurveyListingsEntries,
    (gsDashboardSurveyListingsEntry: GsDashboardSurveyListingsEntry) =>
      gsDashboardSurveyListingsEntry.survey_id
  ) as { [survey_id: string]: GsDashboardSurveyListingsEntry[] };

  const maxRowsToUpdateInEachRound = 8000;

  chunk(surveyEntries, maxRowsToUpdateInEachRound).map(
    ($surveyEntries, index) => {
      const startRow = index * maxRowsToUpdateInEachRound + 2;
      updateSurveysSheetFormulasAndCalculatedColumns(
        surveysSheet,
        $surveyEntries,
        gsDashboardSurveyListingsEntriesBySurveyId,
        startRow,
        $surveyEntries.length
      );
    }
  );

  chunk(combinedQuestionEntries, maxRowsToUpdateInEachRound).map(
    ($combinedQuestionEntries, index) => {
      const startRow = index * maxRowsToUpdateInEachRound + 2;
      updateCombinedQuestionSheetFormulasAndCalculatedColumns(
        combinedQuestionsSheet,
        $combinedQuestionEntries,
        combinedToplineEntries,
        importedIgnoQuestionsInfoEntries,
        gsDashboardSurveyListingsEntriesBySurveyId,
        startRow,
        $combinedQuestionEntries.length
      );
    }
  );

  chunk(combinedToplineEntries, maxRowsToUpdateInEachRound).map(
    ($combinedToplineEntries, index) => {
      const startRow = index * maxRowsToUpdateInEachRound + 2;
      updateCombinedToplineSheetFormulasAndCalculatedColumns(
        combinedToplineSheet,
        $combinedToplineEntries,
        combinedQuestionEntries,
        importedIgnoQuestionsInfoEntries,
        gsDashboardSurveyListingsEntriesBySurveyId,
        startRow,
        $combinedToplineEntries.length
      );
    }
  );

  console.info(`End of devUpdateFormulasAndCalculatedColumns()`);
  /* tslint:enable:no-console */
}
