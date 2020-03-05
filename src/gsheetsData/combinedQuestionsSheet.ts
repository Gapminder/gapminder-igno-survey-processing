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
  fillColumnWithFormulas,
  fillColumnWithValues,
  getSheetDataIncludingHeaderRow,
  lookupGsDashboardSurveyListing
} from "../common";
import { parseSurveyName } from "../lib/parseSurveyName";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { CombinedToplineEntry } from "./combinedToplineSheet";
import { GsDashboardSurveyListingsEntry } from "./gsDashboardSurveyListingsSheet";
import {
  ImportedIgnoQuestionsInfoEntry,
  importedIgnoQuestionsInfoSheetName
} from "./importedIgnoQuestionsInfoSheet";

/**
 * @hidden
 */
export const combinedQuestionsSheetHeaders = [
  "Survey ID",
  "Survey Name",
  "Question number",
  "Question text",
  "Igno Index Question ID",
  "Auto-mapped Igno Index Question ID",
  "Foreign Country Igno Question ID",
  "Auto-mapped Foreign Country Igno Question ID",
  "Igno Index Question",
  "Answer to Igno Index Question",
  "Foreign Country Igno Question",
  "Answer to Foreign Country Igno Question",
  // "Winning answer", // Ignoring this column since it is confusing next to the others
  "Response count",
  "The answer options",
  "Answers by percent",
  "Correct answer(s)",
  "% that answered correctly",
  "Overall Summary",
  "Amount of answer options",
  "% that would have answered correctly in an abc-type question"
];

/**
 * @hidden
 */
export const combinedQuestionsSheetName = "questions_combo";

/**
 * @hidden
 */
export interface QuestionEntry {
  survey_id: any;
  question_number: any;
  question_text: any;
  winning_answer: any;
  response_count: any;
}

/**
 * @hidden
 */
export interface CombinedQuestionEntry {
  survey_id: any;
  survey_name: any;
  question_number: any;
  question_text: any;
  igno_index_question_id: any;
  auto_mapped_igno_index_question_id: any;
  foreign_country_igno_question_id: any;
  auto_mapped_foreign_country_igno_question_id: any;
  igno_index_question: any;
  igno_index_question_correct_answer: any;
  foreign_country_igno_question: any;
  foreign_country_igno_question_correct_answer: any;
  // winning_answer: any; // Ignoring this column since it is confusing next to the others
  response_count: any;
  the_answer_options: any;
  answers_by_percent: any;
  correct_answers: any;
  percent_that_answered_correctly: any;
  overall_summary: any;
  amount_of_answer_options: any;
  percent_that_would_have_answered_correctly_in_an_abc_type_question: any;
}

/**
 * @hidden
 */
export const overviewSheetValueRowToQuestionEntry = (
  overviewSheetRow: any[]
): QuestionEntry => {
  return {
    survey_id: overviewSheetRow[0],
    question_number: overviewSheetRow[1],
    question_text: overviewSheetRow[2],
    winning_answer: overviewSheetRow[3],
    response_count: overviewSheetRow[4]
  };
};

/**
 * @hidden
 */
export const questionEntryToCombinedQuestionSheetValueRow = (
  questionEntry: QuestionEntry
) => [
  questionEntry.survey_id,
  "...", // survey_name formula
  questionEntry.question_number,
  questionEntry.question_text,
  "", // igno_index_question_id blank on new rows
  "", // auto_mapped_igno_index_question_id blank on new rows
  "", // foreign_country_igno_question_id blank on new rows
  "", // auto_mapped_foreign_country_igno_question_id blank on new rows
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_question_correct_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "..." // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
];

/**
 * @hidden
 */
export const combinedQuestionsSheetValueRowToCombinedQuestionEntry = (
  combinedQuestionsSheetRow: any[]
): CombinedQuestionEntry => {
  return {
    survey_id: combinedQuestionsSheetRow[0],
    survey_name: combinedQuestionsSheetRow[1],
    question_number: combinedQuestionsSheetRow[2],
    question_text: combinedQuestionsSheetRow[3],
    igno_index_question_id: combinedQuestionsSheetRow[4],
    auto_mapped_igno_index_question_id: combinedQuestionsSheetRow[5],
    foreign_country_igno_question_id: combinedQuestionsSheetRow[6],
    auto_mapped_foreign_country_igno_question_id: combinedQuestionsSheetRow[7],
    igno_index_question: combinedQuestionsSheetRow[8],
    igno_index_question_correct_answer: combinedQuestionsSheetRow[9],
    foreign_country_igno_question: combinedQuestionsSheetRow[10],
    foreign_country_igno_question_correct_answer: combinedQuestionsSheetRow[11],
    // winning_answer: combinedQuestionsSheetRow[12], // Ignoring this column since it is confusing next to the others
    response_count: combinedQuestionsSheetRow[12],
    the_answer_options: combinedQuestionsSheetRow[13],
    answers_by_percent: combinedQuestionsSheetRow[14],
    correct_answers: combinedQuestionsSheetRow[15],
    percent_that_answered_correctly: combinedQuestionsSheetRow[16],
    overall_summary: combinedQuestionsSheetRow[17],
    amount_of_answer_options: combinedQuestionsSheetRow[18],
    percent_that_would_have_answered_correctly_in_an_abc_type_question:
      combinedQuestionsSheetRow[19]
  };
};

/**
 * @hidden
 */
export const questionEntryToCombinedQuestionsSheetValueRow = questionEntry => [
  questionEntry.survey_id,
  "...", // survey_name formula
  questionEntry.question_number,
  questionEntry.question_text,
  questionEntry.igno_index_question_id,
  questionEntry.auto_mapped_igno_index_question_id,
  questionEntry.foreign_country_igno_question_id,
  questionEntry.auto_mapped_foreign_country_igno_question_id,
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_question_correct_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "..." // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
];

/**
 * @hidden
 */
export function fetchAndVerifyCombinedQuestionsSheet(
  activeSpreadsheet: Spreadsheet
) {
  let combinedQuestionsSheet = activeSpreadsheet.getSheetByName(
    combinedQuestionsSheetName
  );
  if (combinedQuestionsSheet === null) {
    combinedQuestionsSheet = createSheet(
      activeSpreadsheet,
      combinedQuestionsSheetName,
      combinedQuestionsSheetHeaders
    );
  }
  const combinedQuestionsSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders
  );
  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    combinedQuestionsSheetHeaders,
    combinedQuestionsSheetName,
    combinedQuestionsSheetValuesIncludingHeaderRow
  );
  return {
    combinedQuestionsSheet,
    combinedQuestionsSheetValuesIncludingHeaderRow
  };
}

/**
 * @hidden
 */
export function updateCombinedQuestionSheetFormulasAndCalculatedColumns(
  combinedQuestionsSheet,
  combinedQuestionEntries: CombinedQuestionEntry[],
  combinedToplineEntries: CombinedToplineEntry[],
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
    `Start of updateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );

  console.info(
    `Filling formula / calculated value columns for ${numRows} rows`
  );
  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      const gsDashboardSurveyListing = lookupGsDashboardSurveyListing(
        combinedQuestionEntry.survey_id,
        gsDashboardSurveyListingsEntriesBySurveyId
      );
      if (!gsDashboardSurveyListing) {
        return "(No survey name information found)";
      }
      combinedQuestionEntry.survey_name =
        gsDashboardSurveyListing.survey_name_and_link;
      return combinedQuestionEntry.survey_name;
    },
    startRow,
    numRows
  );

  console.info(
    `Creating igno_index_world_views_survey_batch_number+igno_index_question lookup index`
  );
  const importedIgnoQuestionsInfoEntryIgnoIndexMatchKey = (
    importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry
  ) => {
    if (
      !importedIgnoQuestionsInfoEntry.igno_index_world_views_survey_batch_number
    ) {
      console.log(
        "The entry did not have igno_index_world_views_survey_batch_number set",
        {
          importedIgnoQuestionsInfoEntry
        }
      );
      throw new Error(
        "The entry did not have igno_index_world_views_survey_batch_number set"
      );
    }
    if (!importedIgnoQuestionsInfoEntry.igno_index_question) {
      console.log("The entry did not have igno_index_question set", {
        importedIgnoQuestionsInfoEntry
      });
      throw new Error("The entry did not have igno_index_question set");
    }
    return `${importedIgnoQuestionsInfoEntry.igno_index_world_views_survey_batch_number.trim()}-${importedIgnoQuestionsInfoEntry.igno_index_question.trim()}`;
  };
  const importedIgnoQuestionsInfoEntryIgnoIndexLookupIndex = groupBy(
    importedIgnoQuestionsInfoEntries.filter(
      (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
        !!importedIgnoQuestionsInfoEntry.igno_index_world_views_survey_batch_number &&
        !!importedIgnoQuestionsInfoEntry.igno_index_question
    ),
    importedIgnoQuestionsInfoEntryIgnoIndexMatchKey
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Auto-mapped Igno Index Question ID",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      if (
        combinedQuestionEntry.survey_name === "#N/A" ||
        combinedQuestionEntry.survey_name === "" ||
        combinedQuestionEntry.survey_name === "..."
      ) {
        return `(No survey name available)`;
      }
      const { worldViewsSurveyBatchNumber } = parseSurveyName(
        combinedQuestionEntry.survey_name
      );
      if (worldViewsSurveyBatchNumber === false) {
        return `n/a`;
      }
      if (worldViewsSurveyBatchNumber === null) {
        return `(No world views batch number found in survey name "${combinedQuestionEntry.survey_name}")`;
      }
      const matchingImportedIgnoQuestionsInfoEntries =
        importedIgnoQuestionsInfoEntryIgnoIndexLookupIndex[
          combinedQuestionEntry.question_text.trim()
        ];
      if (
        !matchingImportedIgnoQuestionsInfoEntries ||
        matchingImportedIgnoQuestionsInfoEntries.length === 0
      ) {
        return `(No identical questions within batch ${worldViewsSurveyBatchNumber} found)`;
      }
      const autoMappedId = matchingImportedIgnoQuestionsInfoEntries
        .map(
          (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
            importedIgnoQuestionsInfoEntry.igno_index_question_id
        )
        .join("; ");
      // Also set the igno_index_question_id if not already set
      if (
        matchingImportedIgnoQuestionsInfoEntries.length === 1 &&
        combinedQuestionEntry.igno_index_question_id.trim() === ""
      ) {
        combinedQuestionEntry.igno_index_question_id = autoMappedId;
      }
      return autoMappedId;
    },
    startRow,
    numRows
  );

  // Write values of combinedQuestionEntry.igno_index_question_id which we effected above
  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question ID",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      return combinedQuestionEntry.igno_index_question_id;
    },
    startRow,
    numRows
  );

  console.info(
    `Creating foreign_country_country_views_survey_batch_number+foreign_country_igno_question lookup index`
  );
  const importedIgnoQuestionsInfoEntryForeignCountryIgnoIndexMatchKey = (
    importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry
  ) => {
    if (
      !importedIgnoQuestionsInfoEntry.foreign_country_country_views_survey_batch_number
    ) {
      console.log(
        "The entry did not have foreign_country_country_views_survey_batch_number set",
        {
          importedIgnoQuestionsInfoEntry
        }
      );
      throw new Error(
        "The entry did not have foreign_country_country_views_survey_batch_number set"
      );
    }
    if (!importedIgnoQuestionsInfoEntry.foreign_country_igno_question) {
      console.log("The entry did not have foreign_country_igno_question set", {
        importedIgnoQuestionsInfoEntry
      });
      throw new Error(
        "The entry did not have foreign_country_igno_question set"
      );
    }
    return `${importedIgnoQuestionsInfoEntry.foreign_country_country_views_survey_batch_number.trim()}-${importedIgnoQuestionsInfoEntry.foreign_country_igno_question.trim()}`;
  };
  const importedIgnoQuestionsInfoEntryForeignCountryIgnoIndexLookupIndex = groupBy(
    importedIgnoQuestionsInfoEntries.filter(
      (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
        !!importedIgnoQuestionsInfoEntry.foreign_country_country_views_survey_batch_number &&
        !!importedIgnoQuestionsInfoEntry.foreign_country_igno_question
    ),
    importedIgnoQuestionsInfoEntryForeignCountryIgnoIndexMatchKey
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Auto-mapped Foreign Country Igno Question ID",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      if (
        combinedQuestionEntry.survey_name === "#N/A" ||
        combinedQuestionEntry.survey_name === "" ||
        combinedQuestionEntry.survey_name === "..."
      ) {
        return `(No survey name available yet)`;
      }
      const { countryViewsSurveyBatchNumber } = parseSurveyName(
        combinedQuestionEntry.survey_name
      );
      if (countryViewsSurveyBatchNumber === false) {
        return `n/a`;
      }
      if (countryViewsSurveyBatchNumber === null) {
        return `(No country views batch number found in survey name "${combinedQuestionEntry.survey_name}")`;
      }
      const matchingImportedIgnoQuestionsInfoEntries =
        importedIgnoQuestionsInfoEntryForeignCountryIgnoIndexLookupIndex[
          `${countryViewsSurveyBatchNumber}-${combinedQuestionEntry.question_text.trim()}`
        ];
      if (
        !matchingImportedIgnoQuestionsInfoEntries ||
        matchingImportedIgnoQuestionsInfoEntries.length === 0
      ) {
        return `(No identical questions within batch ${countryViewsSurveyBatchNumber} found)`;
      }
      const autoMappedId = matchingImportedIgnoQuestionsInfoEntries
        .map(
          (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
            importedIgnoQuestionsInfoEntry.foreign_country_igno_question_id
        )
        .join("; ");
      // Also set the igno_index_question_id if not already set
      if (
        matchingImportedIgnoQuestionsInfoEntries.length === 1 &&
        combinedQuestionEntry.foreign_country_igno_question_id.trim() === ""
      ) {
        combinedQuestionEntry.foreign_country_igno_question_id = autoMappedId;
      }
      return autoMappedId;
    },
    startRow,
    numRows
  );

  // Write values of combinedQuestionEntry.foreign_country_igno_question_id which we effected above
  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question ID",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      return combinedQuestionEntry.foreign_country_igno_question_id;
    },
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(E[ROW],${importedIgnoQuestionsInfoSheetName}!$A$2:$D,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Igno Index Question",
    `=VLOOKUP(E[ROW],${importedIgnoQuestionsInfoSheetName}!$A$2:$D,4,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question",
    `=VLOOKUP(G[ROW],${importedIgnoQuestionsInfoSheetName}!$E$2:$H,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Foreign Country Igno Question",
    `=VLOOKUP(G[ROW],${importedIgnoQuestionsInfoSheetName}!$E$2:$H,4,FALSE)`,
    startRow,
    numRows
  );

  console.info(`Creating survey_id+question_number lookup index`);
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
      // Row number startRow corresponds to index 0 in the entries array
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
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
          (matchingCombinedToplineEntry: CombinedToplineEntry) =>
            matchingCombinedToplineEntry.answer
        )
        .join(" - ");
    },
    startRow,
    numRows
  );

  const percentStringRoundedToOneDecimal = (percentString: string) =>
    parseFloat(percentString.replace("%", "")).toFixed(1) + "%";

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answers by percent",
    // `=JOIN(" - ",ARRAYFORMULA(TEXT(FILTER(topline_combo!$G$2:$G,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]), "0.0%")))`,
    rowNumber => {
      // Row number startRow corresponds to index 0 in the entries array
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
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
        .map((matchingCombinedToplineEntry: CombinedToplineEntry) =>
          matchingCombinedToplineEntry.answer_by_percent
            ? percentStringRoundedToOneDecimal(
                matchingCombinedToplineEntry.answer_by_percent
              )
            : matchingCombinedToplineEntry.answer_by_percent
        )
        .join(" - ");
    },
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct answer(s)",
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = "x"))`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered correctly",
    `=SUMIFS(topline_combo!$H$2:$H,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,"x")`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Overall Summary",
    `=IFERROR("Response count: "&M[ROW]&"
The answer options: "&N[ROW]&"
Answers by percent: "&O[ROW]&"
Correct answer(s): "&P[ROW]&"
% that answered correctly: "&TEXT(Q[ROW], "0.0%"), "Results not processed yet")`,
    startRow,
    numRows
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Amount of answer options",
    // `=COUNTIFS(topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW])`,
    rowNumber => {
      // Row number startRow corresponds to index 0 in the entries array
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      const matchingCombinedToplineEntries =
        combinedToplineEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(combinedQuestionEntry)
        ];
      return !matchingCombinedToplineEntries
        ? "(No topline entries found)"
        : matchingCombinedToplineEntries.length;
    },
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that would have answered correctly in an abc-type question",
    `=Q[ROW]*S[ROW]/3`,
    startRow,
    numRows
  );

  console.info(
    `End of updateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}
