import { chunk } from "lodash";
import {
  combinedQuestionsSheetValueRowToCombinedQuestionEntry,
  combinedToplineSheetValueRowToCombinedToplineEntry,
  importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry
} from "../gsheetsData/hardcodedConstants";
import {
  fetchAndVerifyCombinedQuestionsSheet,
  fetchAndVerifyCombinedToplineSheet,
  fetchAndVerifyImportedIgnoQuestionsInfoSheet,
  updateCombinedQuestionSheetFormulasAndCalculatedColumns,
  updateCombinedToplineSheetFormulasAndCalculatedColumns
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
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedQuestionsSheet(activeSpreadsheet);
  const {
    combinedToplineSheet,
    combinedToplineSheetValuesIncludingHeaderRow
  } = fetchAndVerifyCombinedToplineSheet(activeSpreadsheet);
  const {
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
  } = fetchAndVerifyImportedIgnoQuestionsInfoSheet(activeSpreadsheet);

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

  const importedIgnoQuestionsInfoSheetValues = importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow.slice(
    1
  );
  const importedIgnoQuestionsInfoEntries = importedIgnoQuestionsInfoSheetValues.map(
    importedIgnoQuestionsInfoSheetValueRowToImportedIgnoQuestionsInfoEntry
  );

  const maxRowsToUpdateInEachRound = 8000;

  chunk(combinedQuestionEntries, maxRowsToUpdateInEachRound).map(
    ($combinedQuestionEntries, index) => {
      const startRow = index * maxRowsToUpdateInEachRound + 2;
      updateCombinedQuestionSheetFormulasAndCalculatedColumns(
        combinedQuestionsSheet,
        $combinedQuestionEntries,
        combinedToplineEntries,
        importedIgnoQuestionsInfoEntries,
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
        startRow,
        $combinedToplineEntries.length
      );
    }
  );

  console.info(`End of devUpdateFormulasAndCalculatedColumns()`);
  /* tslint:enable:no-console */
}
