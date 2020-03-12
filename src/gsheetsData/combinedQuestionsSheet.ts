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
  "Igno Index Question",
  "Correct Answer to Igno Index Question",
  "Very Wrong Answer to Igno Index Question",
  "Foreign Country Igno Question ID",
  "Auto-mapped Foreign Country Igno Question ID",
  "Foreign Country Igno Question",
  "Correct Answer to Foreign Country Igno Question",
  "Very Wrong Answer to Foreign Country Igno Question",
  "Step 5 Question ID",
  "Auto-mapped Step 5 Question ID",
  "Step 5 Question",
  "Correct Answer to Step 5 Question",
  "Very Wrong Answer to Step 5 Question",
  // "Winning answer", // Ignoring this column since it is confusing next to the others
  "Response count",
  "The answer options",
  "Answers by percent",
  "Correct answer(s)",
  "Very wrong answer(s)",
  "% that answered correctly",
  "% that answered very wrong",
  "Overall Summary",
  "Amount of answer options",
  "% that would have answered correctly in an abc-type question",
  "% that would have answered very wrong in an abc-type question"
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
  igno_index_question: any;
  igno_index_question_correct_answer: any;
  igno_index_question_very_wrong_answer: any;
  foreign_country_igno_question_id: any;
  auto_mapped_foreign_country_igno_question_id: any;
  foreign_country_igno_question: any;
  foreign_country_igno_index_question_correct_answer: any;
  foreign_country_igno_index_question_very_wrong_answer: any;
  step5_question_id: any;
  auto_mapped_step5_question_id: any;
  step5_question: any;
  step5_question_correct_answer: any;
  step5_question_very_wrong_answer: any;
  // winning_answer: any; // Ignoring this column since it is confusing next to the others
  response_count: any;
  the_answer_options: any;
  answers_by_percent: any;
  correct_answers: any;
  very_wrong_answers: any;
  percent_that_answered_correctly: any;
  percent_that_answered_very_wrong: any;
  overall_summary: any;
  amount_of_answer_options: any;
  percent_that_would_have_answered_correctly_in_an_abc_type_question: any;
  percent_that_would_have_answered_very_wrong_in_an_abc_type_question: any;
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
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // igno_index_question_very_wrong_answer formula
  "", // foreign_country_igno_question_id blank on new rows
  "", // auto_mapped_foreign_country_igno_question_id blank on new rows
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_index_question_correct_answer formula
  "...", // foreign_country_igno_index_question_very_wrong_answer formula
  "", // step5_question_id blank on new rows
  "", // auto_mapped_step5_question_id blank on new rows
  "...", // step5_question formula
  "...", // step5_question_correct_answer formula
  "...", // step5_question_very_wrong_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // very_wrong_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // percent_that_answered_very_wrong formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "...", // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
  "..." // percent_that_would_have_answered_very_wrong_in_an_abc_type_question formula
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
    igno_index_question: combinedQuestionsSheetRow[6],
    igno_index_question_correct_answer: combinedQuestionsSheetRow[7],
    igno_index_question_very_wrong_answer: combinedQuestionsSheetRow[8],
    foreign_country_igno_question_id: combinedQuestionsSheetRow[9],
    auto_mapped_foreign_country_igno_question_id: combinedQuestionsSheetRow[10],
    foreign_country_igno_question: combinedQuestionsSheetRow[11],
    foreign_country_igno_index_question_correct_answer:
      combinedQuestionsSheetRow[12],
    foreign_country_igno_index_question_very_wrong_answer:
      combinedQuestionsSheetRow[13],
    step5_question_id: combinedQuestionsSheetRow[14],
    auto_mapped_step5_question_id: combinedQuestionsSheetRow[15],
    step5_question: combinedQuestionsSheetRow[16],
    step5_question_correct_answer: combinedQuestionsSheetRow[17],
    step5_question_very_wrong_answer: combinedQuestionsSheetRow[18],
    // winning_answer: combinedQuestionsSheetRow[19], // Ignoring this column since it is confusing next to the others
    response_count: combinedQuestionsSheetRow[19],
    the_answer_options: combinedQuestionsSheetRow[20],
    answers_by_percent: combinedQuestionsSheetRow[21],
    correct_answers: combinedQuestionsSheetRow[22],
    very_wrong_answers: combinedQuestionsSheetRow[23],
    percent_that_answered_correctly: combinedQuestionsSheetRow[24],
    percent_that_answered_very_wrong: combinedQuestionsSheetRow[25],
    overall_summary: combinedQuestionsSheetRow[26],
    amount_of_answer_options: combinedQuestionsSheetRow[27],
    percent_that_would_have_answered_correctly_in_an_abc_type_question:
      combinedQuestionsSheetRow[28],
    percent_that_would_have_answered_very_wrong_in_an_abc_type_question:
      combinedQuestionsSheetRow[29]
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
  "...", // igno_index_question formula
  "...", // igno_index_question_correct_answer formula
  "...", // igno_index_question_very_wrong_answer formula
  questionEntry.foreign_country_igno_question_id,
  questionEntry.auto_mapped_foreign_country_igno_question_id,
  "...", // foreign_country_igno_question formula
  "...", // foreign_country_igno_index_question_correct_answer formula
  "...", // foreign_country_igno_index_question_very_wrong_answer formula
  questionEntry.step5_question_id,
  questionEntry.auto_mapped_step5_question_id,
  "...", // step5_question formula
  "...", // step5_question_correct_answer formula
  "...", // step5_question_very_wrong_answer formula
  // questionEntry.winning_answer, // Ignoring this column since it is confusing next to the others
  questionEntry.response_count,
  "...", // the_answer_options formula
  "...", // answers_by_percent formula
  "...", // correct_answers formula
  "...", // very_wrong_answers formula
  "...", // percent_that_answered_correctly formula
  "...", // percent_that_answered_very_wrong formula
  "...", // overall_summary formula
  "...", // amount_of_answer_options formula
  "...", // percent_that_would_have_answered_correctly_in_an_abc_type_question formula
  "..." // percent_that_would_have_answered_very_wrong_in_an_abc_type_question formula
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
    return `${importedIgnoQuestionsInfoEntry.igno_index_world_views_survey_batch_number
      .trim()
      .toLowerCase()}-${importedIgnoQuestionsInfoEntry.igno_index_question
      .trim()
      .toLowerCase()}`;
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
          `${worldViewsSurveyBatchNumber.toLowerCase()}-${combinedQuestionEntry.question_text
            .trim()
            .toLowerCase()}`
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

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(E[ROW],${importedIgnoQuestionsInfoSheetName}!$A$2:$C,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct Answer to Igno Index Question",
    `=VLOOKUP(E[ROW],${importedIgnoQuestionsInfoSheetName}!$A$2:$D,4,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Very Wrong Answer to Igno Index Question",
    `=VLOOKUP(E[ROW],${importedIgnoQuestionsInfoSheetName}!$A$2:$F,6,FALSE)`,
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
    return `${importedIgnoQuestionsInfoEntry.foreign_country_country_views_survey_batch_number
      .trim()
      .toLowerCase()}-${importedIgnoQuestionsInfoEntry.foreign_country_igno_question
      .trim()
      .toLowerCase()}`;
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
          `${countryViewsSurveyBatchNumber.toLowerCase()}-${combinedQuestionEntry.question_text
            .trim()
            .toLowerCase()}`
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
      // Also set the foreign_country_igno_question_id if not already set
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
    "Foreign Country Igno Question",
    `=VLOOKUP(J[ROW],${importedIgnoQuestionsInfoSheetName}!$G$2:$I,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct Answer to Foreign Country Igno Question",
    `=VLOOKUP(J[ROW],${importedIgnoQuestionsInfoSheetName}!$G$2:$J,4,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Very Wrong Answer to Foreign Country Igno Question",
    `=VLOOKUP(J[ROW],${importedIgnoQuestionsInfoSheetName}!$G$2:$L,6,FALSE)`,
    startRow,
    numRows
  );

  console.info(
    `Creating step5_study_survey_batch_number+step5_question/step5_question_translated_question lookup index`
  );
  const importedIgnoQuestionsInfoEntryStep5IndexMatchKey = (
    importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry
  ) => {
    if (!importedIgnoQuestionsInfoEntry.step5_study_survey_batch_number) {
      console.log(
        "The entry did not have step5_study_survey_batch_number set",
        {
          importedIgnoQuestionsInfoEntry
        }
      );
      throw new Error(
        "The entry did not have step5_study_survey_batch_number set"
      );
    }

    if (
      importedIgnoQuestionsInfoEntry.step5_question_asking_language === "en"
    ) {
      if (!importedIgnoQuestionsInfoEntry.step5_question) {
        console.log("The entry did not have step5_question set", {
          importedIgnoQuestionsInfoEntry
        });
        throw new Error("The entry did not have step5_question set");
      }
      return `${importedIgnoQuestionsInfoEntry.step5_study_survey_batch_number
        .trim()
        .toLowerCase()}-${importedIgnoQuestionsInfoEntry.step5_question
        .trim()
        .toLowerCase()}`;
    } else {
      if (!importedIgnoQuestionsInfoEntry.step5_question_translated_question) {
        console.log(
          "The entry did not have step5_question_translated_question set (and was not asked in 'en' language)",
          {
            importedIgnoQuestionsInfoEntry
          }
        );
        throw new Error(
          "The entry did not have step5_question_translated_question set (and was not asked in 'en' language)"
        );
      }
      return `${importedIgnoQuestionsInfoEntry.step5_study_survey_batch_number
        .trim()
        .toLowerCase()}-${importedIgnoQuestionsInfoEntry.step5_question_translated_question
        .trim()
        .toLowerCase()}`;
    }
  };
  const importedIgnoQuestionsInfoEntryStep5IndexLookupIndex = groupBy(
    importedIgnoQuestionsInfoEntries.filter(
      (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
        !!importedIgnoQuestionsInfoEntry.step5_study_survey_batch_number &&
        ((importedIgnoQuestionsInfoEntry.step5_question_asking_language ===
          "en" &&
          !!importedIgnoQuestionsInfoEntry.step5_question) ||
          (importedIgnoQuestionsInfoEntry.step5_question_asking_language !==
            "en" &&
            !!importedIgnoQuestionsInfoEntry.step5_question_translated_question))
    ),
    importedIgnoQuestionsInfoEntryStep5IndexMatchKey
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Auto-mapped Step 5 Question ID",
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
      const { studySurveyBatchNumber } = parseSurveyName(
        combinedQuestionEntry.survey_name
      );
      if (studySurveyBatchNumber === false) {
        return `n/a`;
      }
      if (studySurveyBatchNumber === null) {
        return `(No study survey batch number found in survey name "${combinedQuestionEntry.survey_name}")`;
      }
      const matchingImportedIgnoQuestionsInfoEntries =
        importedIgnoQuestionsInfoEntryStep5IndexLookupIndex[
          `${studySurveyBatchNumber}-${combinedQuestionEntry.question_text.trim()}`
        ];
      if (
        !matchingImportedIgnoQuestionsInfoEntries ||
        matchingImportedIgnoQuestionsInfoEntries.length === 0
      ) {
        return `(No identical questions within batch ${studySurveyBatchNumber} found)`;
      }
      const autoMappedId = matchingImportedIgnoQuestionsInfoEntries
        .map(
          (importedIgnoQuestionsInfoEntry: ImportedIgnoQuestionsInfoEntry) =>
            importedIgnoQuestionsInfoEntry.step5_question_id
        )
        .join("; ");
      // Also set the step5_question_id if not already set
      if (
        matchingImportedIgnoQuestionsInfoEntries.length === 1 &&
        combinedQuestionEntry.step5_question_id.trim() === ""
      ) {
        combinedQuestionEntry.step5_question_id = autoMappedId;
      }
      return autoMappedId;
    },
    startRow,
    numRows
  );

  // Write values of combinedQuestionEntry.step5_question_id which we effected above
  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Step 5 Question ID",
    rowNumber => {
      const combinedQuestionEntry =
        combinedQuestionEntries[rowNumber - startRow];
      return combinedQuestionEntry.step5_question_id;
    },
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Step 5 Question",
    `=VLOOKUP(O[ROW],${importedIgnoQuestionsInfoSheetName}!$M$2:$O,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct Answer to Step 5 Question",
    `=VLOOKUP(O[ROW],${importedIgnoQuestionsInfoSheetName}!$M$2:$Q,5,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Very Wrong Answer to Step 5 Question",
    `=VLOOKUP(O[ROW],${importedIgnoQuestionsInfoSheetName}!$M$2:$S,7,FALSE)`,
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
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = 1))`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Very wrong answer(s)",
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = 3))`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered correctly",
    `=SUMIFS(topline_combo!$H$2:$H,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,1)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered very wrong",
    `=IF(COUNTIFS(topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,3)=0,"n/a",SUMIFS(topline_combo!$H$2:$H,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,3))`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Overall Summary",
    `=IFERROR("Correct: "&W[ROW]&"
ALT:     "&U[ROW]&"
RES:    "&V[ROW], "not ready")`,
    /*
    `=IFERROR("Response count: "&T[ROW]&"
The answer options: "&U[ROW]&"
Answers by percent: "&V[ROW]&"
Correct answer(s): "&W[ROW]&"
Very wrong answer(s): "&IFERROR(X[ROW],"n/a")&"
% that answered correctly: "&TEXT(Y[ROW], "0.0%")&"
% that answered very wrong: "&TEXT(Z[ROW], "0.0%"), "Results not processed yet")`,
     */
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
    `=Y[ROW]*AB[ROW]/3`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that would have answered very wrong in an abc-type question",
    `=IF(AB[ROW]="n/a","n/a",AB[ROW]*$AD[ROW]/3)`,
    startRow,
    numRows
  );

  console.info(
    `End of updateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}
