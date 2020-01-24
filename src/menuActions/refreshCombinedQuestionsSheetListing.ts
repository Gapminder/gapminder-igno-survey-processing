import difference from "lodash/difference";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import File = GoogleAppsScript.Drive.File;
import groupBy from "lodash/groupBy";
import intersection from "lodash/intersection";
import union from "lodash/union";
import {
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetValueRowToQuestionEntry,
  overviewEntryToCombinedQuestionSheetValueRow,
  overviewSheetValueRowToOverviewEntry,
  questionEntryToCombinedQuestionsSheetValueRow,
  surveysSheetName,
  surveysSheetValueRowToSurveyEntry
} from "../gsheetsData/hardcodedConstants";
import {
  adjustSheetRowsAndColumnsCount,
  fileNameToSurveyId,
  fillColumnWithFormulas,
  fillColumnWithValues,
  getSheetDataIncludingHeaderRow
} from "./common";

/**
 * @hidden
 */
export function refreshCombinedQuestionsSheetListing(
  updatedSurveysSheetValues: any[][],
  updatedCombinedToplineEntries,
  combinedQuestionsSheet: Sheet,
  combinedQuestionsSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  /* tslint:disable:no-console */
  console.info(`Start of refreshCombinedQuestionsSheetListing()`);

  // From the existing sheet contents, purge entries that does not have an entry in the surveys sheet
  // so that the combined question listing only contains rows that are relevant for analysis
  console.info(`Purging orphaned rows from the combined question listing`);
  const combinedQuestionsSheetValues = combinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const existingSurveyEntries = updatedSurveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );
  const existingQuestionEntries = combinedQuestionsSheetValues.map(
    combinedQuestionsSheetValueRowToQuestionEntry
  );
  const existingSurveysSurveyIds = existingSurveyEntries.map(
    existingSurveyEntry => fileNameToSurveyId(existingSurveyEntry.file_name)
  );
  const existingQuestionSurveyIds = union(
    existingQuestionEntries.map(
      existingQuestionEntry => existingQuestionEntry.survey_id
    )
  );

  const surveyIdsInBothListings = intersection(
    existingSurveysSurveyIds,
    existingQuestionSurveyIds
  );

  const questionEntriesWithSurveyEntry = existingQuestionEntries.filter(
    questionEntry => surveyIdsInBothListings.includes(questionEntry.survey_id)
  );

  // Write the purged/trimmed contents back to the sheet
  console.info(`Writing the purged/trimmed contents back to the sheet`);
  if (questionEntriesWithSurveyEntry.length > 0) {
    // If we ended up with less rows than what already exists, clear all rows except the header row
    // so that we do not keep old rows hanging around
    if (
      questionEntriesWithSurveyEntry.length <
      combinedQuestionsSheetValues.length
    ) {
      // Clear all rows except the header row
      console.info(`Clearing all rows except the header row`);
      combinedQuestionsSheet
        .getRange(
          2,
          1,
          combinedQuestionsSheetValuesIncludingHeaderRow.length,
          combinedQuestionsSheetValuesIncludingHeaderRow[0].length
        )
        .clearContent();
    }

    combinedQuestionsSheet
      .getRange(
        2,
        1,
        questionEntriesWithSurveyEntry.length,
        combinedQuestionsSheetValuesIncludingHeaderRow[0].length
      )
      .setValues(
        questionEntriesWithSurveyEntry.map(
          questionEntryToCombinedQuestionsSheetValueRow
        )
      );
  }
  let rowsWritten = questionEntriesWithSurveyEntry.length;

  console.info(
    `Finding which gsheet files are not-yet-included in the combined question listing`
  );
  const gsResultsFolderGsheetFilesSurveyIds = union(
    gsResultsFolderGsheetFiles.map(gsResultsFolderGsheetFile =>
      fileNameToSurveyId(gsResultsFolderGsheetFile.getName())
    )
  );
  const notYetIncludedGsResultsFolderGsheetFilesSurveyIds = difference(
    gsResultsFolderGsheetFilesSurveyIds,
    existingQuestionSurveyIds
  );
  const notYetIncludedGsResultsFolderGsheetFiles = gsResultsFolderGsheetFiles.filter(
    (gsResultsFolderGsheetFile: File) => {
      const surveyId = fileNameToSurveyId(gsResultsFolderGsheetFile.getName());
      return notYetIncludedGsResultsFolderGsheetFilesSurveyIds.includes(
        surveyId
      );
    }
  );
  // Open each not-yet-included gsheet file and add rows to the end of the sheet continuously
  if (notYetIncludedGsResultsFolderGsheetFiles.length > 0) {
    console.info(
      `Opening the ${notYetIncludedGsResultsFolderGsheetFiles.length} not-yet-included gsheet file(s) and adding them to the end of the sheet`
    );
    // console.log({ notYetIncludedGsResultsFolderGsheetFiles });
    notYetIncludedGsResultsFolderGsheetFiles.map(
      (gsResultsFolderGsheetFile: File) => {
        const gsResultsFolderGsheet = SpreadsheetApp.openById(
          gsResultsFolderGsheetFile.getId()
        );
        const sourceSheet = gsResultsFolderGsheet.getSheetByName("Overview");
        const sourceDataRange = sourceSheet.getDataRange();
        const sourceValuesIncludingHeaderRow = sourceDataRange.getValues();
        // const sourceHeaderRows = sourceValuesIncludingHeaderRow.slice(0, 1);
        const sourceValues = sourceValuesIncludingHeaderRow.slice(1);
        const targetValues = sourceValues
          .map(overviewSheetValueRowToOverviewEntry)
          .map(overviewEntryToCombinedQuestionSheetValueRow);
        combinedQuestionsSheet
          .getRange(
            rowsWritten + 2,
            1,
            sourceValues.length,
            combinedQuestionsSheetHeaders.length
          )
          .setValues(targetValues);
        rowsWritten += sourceValues.length;
      }
    );
  }

  // Read back the updated combined question sheet data
  console.info(`Reading back the updated combined question sheet data`);
  const updatedCombinedQuestionsSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders
  );

  // Limit the amount of rows of the worksheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the combined questions worksheet to the amount of entries`
  );
  const updatedCombinedQuestionsSheetData = updatedCombinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  adjustSheetRowsAndColumnsCount(
    combinedQuestionsSheet,
    updatedCombinedQuestionsSheetData.length + 1,
    updatedCombinedQuestionsSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(E[ROW],imported_igno_questions_info!$A$3:$C,2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question",
    `=VLOOKUP(F[ROW],imported_igno_questions_info!$D$3:$E,2,FALSE)`,
    updatedCombinedQuestionsSheetData.length
  );

  const updatedCombinedQuestionEntries = updatedCombinedQuestionsSheetData.map(
    combinedQuestionsSheetValueRowToQuestionEntry
  );
  const combineSurveyIdAndQuestionNumber = updatedCombinedEntry =>
    `${updatedCombinedEntry.survey_id}-${updatedCombinedEntry.question_number}`;
  const updatedCombinedToplineEntriesBySurveyIdAndQuestionNumber = groupBy(
    updatedCombinedToplineEntries,
    combineSurveyIdAndQuestionNumber
  );

  fillColumnWithValues(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "The answer options",
    // `=JOIN(" - ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]))`,
    rowNumber => {
      // Row number 2 corresponds to index 0 in the entries array
      const updatedCombinedQuestionEntry =
        updatedCombinedQuestionEntries[rowNumber - 2];
      const matchingUpdatedCombinedToplineEntries =
        updatedCombinedToplineEntriesBySurveyIdAndQuestionNumber[
          combineSurveyIdAndQuestionNumber(updatedCombinedQuestionEntry)
        ];
      if (matchingUpdatedCombinedToplineEntries.length === 0) {
        return "(No topline entries found)";
      }
      return matchingUpdatedCombinedToplineEntries
        .map(
          matchingUpdatedCombinedToplineEntry =>
            matchingUpdatedCombinedToplineEntry.answer
        )
        .join(" - ");
    },
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answers by percent",
    `=JOIN(" - ",ARRAYFORMULA(TEXT(FILTER(topline_combo!$G$2:$G,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW]), "0.0%")))`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Correct answer(s)",
    `=JOIN("; ",FILTER(topline_combo!$E$2:$E,topline_combo!$A$2:$A = $A[ROW],topline_combo!$C$2:$C = $C[ROW],topline_combo!$F$2:$F = "x"))`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that answered correctly",
    `=SUMIFS(topline_combo!$G$2:$G,topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW],topline_combo!$F$2:$F,"X")`,
    updatedCombinedQuestionsSheetData.length
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
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Amount of answer options",
    `=COUNTIFS(topline_combo!$A$2:$A,$A[ROW],topline_combo!$C$2:$C,$C[ROW])`,
    updatedCombinedQuestionsSheetData.length
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "% that would have answered correctly in an abc-type question",
    `=M[ROW]*O[ROW]/3`,
    updatedCombinedQuestionsSheetData.length
  );

  console.info(`End of refreshCombinedQuestionsSheetListing()`);
  /* tslint:enable:no-console */
}
