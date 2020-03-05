/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

import groupBy from "lodash/groupBy";
import {
  assertCorrectLeftmostSheetColumnHeaders,
  combineSurveyIdAndQuestionNumber,
  createSheet,
  fillColumnWithValues,
  getSheetDataIncludingHeaderRow,
  lookupGsDashboardSurveyListing
} from "../common";
import { answerOptionMatchesFactualAnswer } from "../lib/answerOptionMatchesFactualAnswer";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import {
  CombinedQuestionEntry,
  combinedQuestionsSheetName
} from "./combinedQuestionsSheet";
import { GsDashboardSurveyListingsEntry } from "./gsDashboardSurveyListingsSheet";
import {
  ImportedIgnoQuestionsInfoEntry,
  importedIgnoQuestionsInfoSheetName
} from "./importedIgnoQuestionsInfoSheet";

/**
 * @hidden
 */
export const combinedToplineSheetHeaders = [
  "Survey ID",
  "Survey Name",
  "Question number",
  "Question text",
  "Answer",
  'Correct? ("x" marks correct answers)',
  "Auto-marked correct answers",
  "Answer by percent",
  "Metadata",
  "Weighted by"
];

/**
 * @hidden
 */
export const combinedToplineSheetName = "topline_combo";

/**
 * @hidden
 */
export interface ToplineEntry {
  survey_id: any;
  question_number: any;
  question_text: any;
  answer: any;
  answer_by_percent: any;
  metadata: any;
  weighted_by: any;
}

/**
 * @hidden
 */
export interface CombinedToplineEntry {
  survey_id: any;
  survey_name: any;
  question_number: any;
  question_text: any;
  answer: any;
  x_marks_correct_answers: any;
  auto_marked_correct_answers: any;
  answer_by_percent: any;
  metadata: any;
  weighted_by: any;
}

/**
 * @hidden
 */
export const toplineSheetValueRowToToplineEntry = (
  toplineSheetRow: any[]
): ToplineEntry => {
  return {
    survey_id: toplineSheetRow[0],
    question_number: toplineSheetRow[1],
    question_text: toplineSheetRow[2],
    answer: toplineSheetRow[3],
    answer_by_percent: toplineSheetRow[4],
    metadata: toplineSheetRow[5],
    weighted_by: toplineSheetRow[6]
  };
};

/**
 * @hidden
 */
export const toplineEntryToCombinedToplineSheetValueRow = (
  toplineEntry: ToplineEntry
) => [
  toplineEntry.survey_id,
  "...", // survey_name formula
  toplineEntry.question_number,
  toplineEntry.question_text,
  toplineEntry.answer,
  "", // x_marks_correct_answers left blank
  "", // auto_marked_correct_answers left blank
  toplineEntry.answer_by_percent,
  toplineEntry.metadata,
  toplineEntry.weighted_by
];

/**
 * @hidden
 */
export const combinedToplineSheetValueRowToCombinedToplineEntry = (
  combinedToplineSheetRow: any[]
): CombinedToplineEntry => {
  return {
    survey_id: combinedToplineSheetRow[0],
    survey_name: combinedToplineSheetRow[1],
    question_number: combinedToplineSheetRow[2],
    question_text: combinedToplineSheetRow[3],
    answer: combinedToplineSheetRow[4],
    x_marks_correct_answers: combinedToplineSheetRow[5],
    auto_marked_correct_answers: combinedToplineSheetRow[6],
    answer_by_percent: combinedToplineSheetRow[7],
    metadata: combinedToplineSheetRow[8],
    weighted_by: combinedToplineSheetRow[9]
  };
};

/**
 * @hidden
 */
export const combinedToplineEntryToCombinedToplineSheetValueRow = (
  combinedToplineEntry: CombinedToplineEntry
) => [
  combinedToplineEntry.survey_id,
  "...", // survey_name formula
  combinedToplineEntry.question_number,
  combinedToplineEntry.question_text,
  combinedToplineEntry.answer,
  combinedToplineEntry.x_marks_correct_answers,
  combinedToplineEntry.answer_by_percent,
  combinedToplineEntry.metadata,
  combinedToplineEntry.weighted_by
];

/**
 * @hidden
 */
export function fetchAndVerifyCombinedToplineSheet(
  activeSpreadsheet: Spreadsheet
) {
  let combinedToplineSheet = activeSpreadsheet.getSheetByName(
    combinedToplineSheetName
  );
  if (combinedToplineSheet === null) {
    combinedToplineSheet = createSheet(
      activeSpreadsheet,
      combinedToplineSheetName,
      combinedToplineSheetHeaders
    );
  }
  const combinedToplineSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedToplineSheet,
    combinedToplineSheetHeaders
  );
  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    combinedToplineSheetHeaders,
    combinedToplineSheetName,
    combinedToplineSheetValuesIncludingHeaderRow
  );
  return { combinedToplineSheet, combinedToplineSheetValuesIncludingHeaderRow };
}

/**
 * @hidden
 */
export function updateCombinedToplineSheetFormulasAndCalculatedColumns(
  combinedToplineSheet,
  combinedToplineEntries: CombinedToplineEntry[],
  combinedQuestionEntries: CombinedQuestionEntry[],
  importedIgnoQuestionsInfoEntries: ImportedIgnoQuestionsInfoEntry[],
  gsDashboardSurveyListingsEntriesBySurveyId: {
    [survey_id: string]: GsDashboardSurveyListingsEntry[];
  },
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  if (numRows === 0) {
    console.info(`No rows to update, skipping`);
    return;
  }

  console.info(
    `Start of updateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );

  console.info(
    `Filling formula / calculated value columns for ${numRows} rows`
  );

  fillColumnWithValues(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    "Survey Name",
    rowNumber => {
      const combinedToplineEntry = combinedToplineEntries[rowNumber - startRow];
      const gsDashboardSurveyListing = lookupGsDashboardSurveyListing(
        combinedToplineEntry.survey_id,
        gsDashboardSurveyListingsEntriesBySurveyId
      );
      if (!gsDashboardSurveyListing) {
        return "(No survey name information found)";
      }
      combinedToplineEntry.survey_name =
        gsDashboardSurveyListing.survey_name_and_link;
      return combinedToplineEntry.survey_name;
    },
    startRow,
    numRows
  );

  console.info(`Creating lookup indices`);
  const combinedQuestionEntriesBySurveyIdAndQuestionNumber = groupBy(
    combinedQuestionEntries,
    combineSurveyIdAndQuestionNumber
  ) as { [k: string]: CombinedQuestionEntry[] };

  const importedIgnoQuestionsInfoEntriesByIgnoQuestionId = groupBy(
    importedIgnoQuestionsInfoEntries.filter(
      importedIgnoQuestionsInfoEntry =>
        !!importedIgnoQuestionsInfoEntry.igno_index_question_id
    ),
    importedIgnoQuestionsInfoEntry =>
      importedIgnoQuestionsInfoEntry.igno_index_question_id
  ) as { [k: string]: ImportedIgnoQuestionsInfoEntry[] };

  const importedIgnoQuestionsInfoEntriesByForeignCountryIgnoQuestionId = groupBy(
    importedIgnoQuestionsInfoEntries.filter(
      importedIgnoQuestionsInfoEntry =>
        !!importedIgnoQuestionsInfoEntry.foreign_country_igno_question_id
    ),
    importedIgnoQuestionsInfoEntry =>
      importedIgnoQuestionsInfoEntry.foreign_country_igno_question_id
  ) as { [k: string]: ImportedIgnoQuestionsInfoEntry[] };

  fillColumnWithValues(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    "Auto-marked correct answers",
    rowNumber => {
      const combinedToplineEntry = combinedToplineEntries[rowNumber - startRow];
      const correspondingCombinedQuestionEntries =
        combinedQuestionEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(combinedToplineEntry)
        ];
      if (
        !correspondingCombinedQuestionEntries ||
        correspondingCombinedQuestionEntries.length === 0
      ) {
        return `(No corresponding question entry found in ${combinedQuestionsSheetName})`;
      }
      const correspondingCombinedQuestionEntry =
        correspondingCombinedQuestionEntries[0];
      let factualAnswer;
      if (
        correspondingCombinedQuestionEntry.igno_index_question_id &&
        correspondingCombinedQuestionEntry.igno_index_question_id.trim() !== ""
      ) {
        const correspondingImportedIgnoQuestionsInfoEntries =
          importedIgnoQuestionsInfoEntriesByIgnoQuestionId[
            correspondingCombinedQuestionEntry.igno_index_question_id
          ];
        if (
          !correspondingImportedIgnoQuestionsInfoEntries ||
          correspondingImportedIgnoQuestionsInfoEntries.length === 0
        ) {
          return `(No matching imported igno question info entry found in ${importedIgnoQuestionsInfoSheetName})`;
        }
        factualAnswer =
          correspondingImportedIgnoQuestionsInfoEntries[0]
            .igno_index_question_correct_answer;
      } else if (
        correspondingCombinedQuestionEntry.foreign_country_igno_question_id &&
        correspondingCombinedQuestionEntry.foreign_country_igno_question_id.trim() !==
          ""
      ) {
        const correspondingImportedIgnoQuestionsInfoEntries =
          importedIgnoQuestionsInfoEntriesByForeignCountryIgnoQuestionId[
            correspondingCombinedQuestionEntry.foreign_country_igno_question_id
          ];
        if (
          !correspondingImportedIgnoQuestionsInfoEntries ||
          correspondingImportedIgnoQuestionsInfoEntries.length === 0
        ) {
          return `(No matching imported igno question info entry found in ${importedIgnoQuestionsInfoSheetName})`;
        }
        factualAnswer =
          correspondingImportedIgnoQuestionsInfoEntries[0]
            .foreign_country_igno_question_correct_answer;
      } else {
        return `(Question ID not mapped)`;
      }
      if (factualAnswer === undefined || factualAnswer.trim() === "") {
        return `(No factual answer provided in input sheet)`;
      }

      const autoMarkedAsCorrect = answerOptionMatchesFactualAnswer(
        combinedToplineEntry.answer,
        factualAnswer
      );

      // Update the actual x markings if no correct answers had been marked previously, which is true
      // if the formula yields "#N/A" or if it is for a newly added row ("...")
      if (
        correspondingCombinedQuestionEntry.correct_answers === "#N/A" ||
        correspondingCombinedQuestionEntry.correct_answers === "..."
      ) {
        combinedToplineEntry.x_marks_correct_answers = autoMarkedAsCorrect
          ? "x"
          : "";
      }

      return autoMarkedAsCorrect ? "x" : "";
    },
    startRow,
    numRows
  );

  // Write values of combinedToplineEntry.x_marks_correct_answers which we effected above
  fillColumnWithValues(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    'Correct? ("x" marks correct answers)',
    rowNumber => {
      const combinedToplineEntry = combinedToplineEntries[rowNumber - startRow];
      return combinedToplineEntry.x_marks_correct_answers;
    },
    startRow,
    numRows
  );

  console.info(
    `End of updateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}
