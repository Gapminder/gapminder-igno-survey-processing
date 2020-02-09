import groupBy from "lodash/groupBy";
import {
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetValueRowToCombinedQuestionEntry,
  combinedToplineSheetHeaders,
  combinedToplineSheetValueRowToCombinedToplineEntry,
  gsDashboardSurveyListingsSheetName,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import {
  fetchAndVerifyCombinedQuestionsSheet,
  fetchAndVerifyCombinedToplineSheet,
  fillColumnWithFormulas,
  fillColumnWithValues
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

  devUpdateCombinedQuestionSheetFormulasAndCalculatedColumns(
    combinedQuestionsSheet,
    combinedQuestionEntries,
    combinedToplineEntries
  );
  devUpdateCombinedToplineSheetFormulasAndCalculatedColumns(
    combinedToplineSheet,
    combinedToplineEntries
  );

  console.info(`End of devUpdateFormulasAndCalculatedColumns()`);
  /* tslint:enable:no-console */
}

/**
 * @hidden
 */
function devUpdateCombinedQuestionSheetFormulasAndCalculatedColumns(
  combinedQuestionsSheet,
  combinedQuestionEntries,
  combinedToplineEntries
) {
  /* tslint:disable:no-console */
  console.info(
    `Start of devUpdateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(E[ROW],imported_igno_questions_info!$A$3:$C,2,FALSE)`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Igno Index Question",
    `=VLOOKUP(E[ROW],imported_igno_questions_info!$A$3:$C,3,FALSE)`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question",
    `=VLOOKUP(F[ROW],imported_igno_questions_info!$D$3:$E,2,FALSE)`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Foreign Country Igno Question",
    `=VLOOKUP(F[ROW],imported_igno_questions_info!$D$3:$E,3,FALSE)`,
    combinedQuestionEntries.length
  );

  const combineSurveyIdAndQuestionNumber = combinedEntry => {
    if (!combinedEntry.survey_id) {
      console.log("The entry did not have survey_id set", {
        combinedEntry
      });
      throw new Error("The entry did not have survey_id set");
    }
    if (!combinedEntry.question_number) {
      console.log("The entry did not have question_number set", {
        combinedEntry
      });
      throw new Error("The entry did not have question_number set");
    }
    return `${combinedEntry.survey_id}-${combinedEntry.question_number}`;
  };
  const combinedToplineEntriesBySurveyIdAndQuestionNumber = groupBy(
    combinedToplineEntries,
    combineSurveyIdAndQuestionNumber
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "The answer options",
    // `=JOIN(" - ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]))`,
    rowNumber => {
      // Row number 2 corresponds to index 0 in the entries array
      const combinedQuestionEntry = combinedQuestionEntries[rowNumber - 2];
      const matchingCombinedToplineEntries =
        combinedToplineEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(combinedQuestionEntry)
        ];
      if (
        !matchingCombinedToplineEntries ||
        matchingCombinedToplineEntries.length === 0
      ) {
        return "(No topline entries found)";
      }
      return matchingCombinedToplineEntries
        .map(
          matchingCombinedToplineEntry => matchingCombinedToplineEntry.answer
        )
        .join(" - ");
    },
    combinedQuestionEntries.length
  );

  const percentStringRoundedToOneDecimal = (percentString: string) =>
    parseFloat(percentString.replace("%", "")).toFixed(1) + "%";

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answers by percent",
    // `=JOIN(" - ",ARRAYFORMULA(TEXT(FILTER(topline_combo!$G$2:$G,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]), "0.0%")))`,
    rowNumber => {
      // Row number 2 corresponds to index 0 in the entries array
      const combinedQuestionEntry = combinedQuestionEntries[rowNumber - 2];
      const matchingCombinedToplineEntries =
        combinedToplineEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(combinedQuestionEntry)
        ];
      if (
        !matchingCombinedToplineEntries ||
        matchingCombinedToplineEntries.length === 0
      ) {
        return "(No topline entries found)";
      }
      return matchingCombinedToplineEntries
        .map(matchingCombinedToplineEntry =>
          matchingCombinedToplineEntry.answer_by_percent
            ? percentStringRoundedToOneDecimal(
                matchingCombinedToplineEntry.answer_by_percent
              )
            : matchingCombinedToplineEntry.answer_by_percent
        )
        .join(" - ");
    },
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct answer(s)",
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = "x"))`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered correctly",
    `=SUMIFS(topline_combo!$G$2:$G,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,"x")`,
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Overall Summary",
    `=IFERROR("Response count: "&I[ROW]&"
The answer options: "&J[ROW]&"
Answers by percent: "&K[ROW]&"
Correct answer(s): "&L[ROW]&"
% that answered correctly: "&TEXT(M[ROW], "0.0%"), "Results not processed yet")`,
    combinedQuestionEntries.length
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Amount of answer options",
    // `=COUNTIFS(topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW])`,
    rowNumber => {
      // Row number 2 corresponds to index 0 in the entries array
      const combinedQuestionEntry = combinedQuestionEntries[rowNumber - 2];
      const matchingCombinedToplineEntries =
        combinedToplineEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(combinedQuestionEntry)
        ];
      return !matchingCombinedToplineEntries
        ? "(No topline entries found)"
        : matchingCombinedToplineEntries.length;
    },
    combinedQuestionEntries.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that would have answered correctly in an abc-type question",
    `=M[ROW]*O[ROW]/3`,
    combinedQuestionEntries.length
  );

  console.info(
    `End of devUpdateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}

/**
 * @hidden
 */
function devUpdateCombinedToplineSheetFormulasAndCalculatedColumns(
  combinedToplineSheet,
  combinedToplineEntries
) {
  /* tslint:disable:no-console */
  console.info(
    `Start of devUpdateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormulas(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    combinedToplineEntries.length
  );

  console.info(
    `End of devUpdateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}
