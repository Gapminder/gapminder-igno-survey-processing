import difference from "lodash/difference";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import File = GoogleAppsScript.Drive.File;
import union from "lodash/union";
import {
  adjustSheetRowsAndColumnsCount,
  fileNameToSurveyId,
  lookupGsDashboardSurveyListing,
  openSpreadsheetByIdAtMostOncePerScriptRun
} from "../common";
import {
  CombinedQuestionEntry,
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetValueRowToCombinedQuestionEntry,
  overviewSheetValueRowToQuestionEntry,
  QuestionEntry,
  questionEntryToCombinedQuestionSheetValueRow
} from "../gsheetsData/combinedQuestionsSheet";
import { CombinedToplineEntry } from "../gsheetsData/combinedToplineSheet";
import { GsDashboardSurveyListingsEntry } from "../gsheetsData/gsDashboardSurveyListingsSheet";
import { SurveyEntry } from "../gsheetsData/surveysSheet";

/**
 * @hidden
 */
export function refreshCombinedQuestionsSheetListing(
  updatedSurveyEntries: SurveyEntry[],
  updatedCombinedToplineEntries: CombinedToplineEntry[],
  gsDashboardSurveyListingsEntriesBySurveyId: {
    [survey_id: string]: GsDashboardSurveyListingsEntry[];
  },
  combinedQuestionsSheet: Sheet,
  combinedQuestionsSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  /* tslint:disable:no-console */
  console.info(`Start of refreshCombinedQuestionsSheetListing()`);

  let updatedCombinedQuestionEntries;

  const combinedQuestionsSheetValues = combinedQuestionsSheetValuesIncludingHeaderRow.slice(
    1
  );
  const existingQuestionEntries = combinedQuestionsSheetValues.map(
    combinedQuestionsSheetValueRowToCombinedQuestionEntry
  );

  const existingQuestionSurveyIds = union(
    existingQuestionEntries.map(
      existingQuestionEntry => existingQuestionEntry.survey_id
    )
  );

  // From the existing sheet contents, purge entries that does not have an entry in the surveys sheet
  // so that the combined question listing only contains rows that are relevant for analysis
  // Inactivated because of the new (faster)  paradigm of only importing
  // new rows, never touching old rows by default
  // Would require formula-calculations directly instead of "..." placeholder to reactivate
  /*
  console.info(`Checking for orphaned rows in the combined question listing`);
  const existingSurveysSurveyIds = updatedSurveyEntries.map(
    existingSurveyEntry => fileNameToSurveyId(existingSurveyEntry.file_name)
  );
  const surveyIdsInBothListings = intersection(
    existingSurveysSurveyIds,
    existingQuestionSurveyIds
  );

  const questionEntriesWithSurveyEntry = existingQuestionEntries.filter(
    questionEntry => surveyIdsInBothListings.includes(questionEntry.survey_id)
  );

  // Remove orphaned rows in the combined question listing if necessary
  if (
    questionEntriesWithSurveyEntry.length < combinedQuestionsSheetValues.length
  ) {
    console.info(`Removing orphaned rows in the combined question listing`);
    // If we ended up with less rows than what already exists, clear all rows except the header row
    // so that we do not keep old rows hanging around
    console.info(`Clearing all rows except the header row`);
    combinedQuestionsSheet
      .getRange(
        2,
        1,
        combinedQuestionsSheetValuesIncludingHeaderRow.length,
        combinedQuestionsSheetValuesIncludingHeaderRow[0].length
      )
      .clearContent();
    if (questionEntriesWithSurveyEntry.length > 0) {
      console.info(`Writing back the non-orphaned rows`);
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
    updatedCombinedQuestionEntries = questionEntriesWithSurveyEntry;
  } else {
    updatedCombinedQuestionEntries = existingQuestionEntries;
  }
  */
  updatedCombinedQuestionEntries = existingQuestionEntries;

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
  // Open each not-yet-included gsheet file and add rows to the end of the sheet
  let newCombinedQuestionEntries: CombinedQuestionEntry[] = [];
  if (notYetIncludedGsResultsFolderGsheetFiles.length > 0) {
    console.info(
      `Adding the contents of the ${notYetIncludedGsResultsFolderGsheetFiles.length} not-yet-included gsheet file(s) to the end of the sheet`
    );
    // console.log({ notYetIncludedGsResultsFolderGsheetFiles });
    const arraysOfEntriesToAdd = notYetIncludedGsResultsFolderGsheetFiles.map(
      (gsResultsFolderGsheetFile: File) => {
        const gsResultsFolderGsheet = openSpreadsheetByIdAtMostOncePerScriptRun(
          gsResultsFolderGsheetFile.getId()
        );
        const sourceSheet = gsResultsFolderGsheet.getSheetByName("Overview");
        const sourceDataRange = sourceSheet.getDataRange();
        const sourceValuesIncludingHeaderRow = sourceDataRange.getDisplayValues();
        // const sourceHeaderRows = sourceValuesIncludingHeaderRow.slice(0, 1);
        const sourceValues = sourceValuesIncludingHeaderRow.slice(1);
        const targetEntries = sourceValues.map(
          overviewSheetValueRowToQuestionEntry
        );
        console.info(
          `Read ${
            targetEntries.length
          } rows from spreadsheet with id ${gsResultsFolderGsheetFile.getId()}`
        );

        // skip entries that are without survey metadata
        const firstEntry = targetEntries[0];
        const gsDashboardSurveyListing = lookupGsDashboardSurveyListing(
          firstEntry.survey_id,
          gsDashboardSurveyListingsEntriesBySurveyId
        );
        if (!gsDashboardSurveyListing) {
          console.info("Not including since survey metadata is missing");
          return [];
        }

        return targetEntries;
      }
    );
    // flatten
    const entriesToAdd: QuestionEntry[] = [].concat.apply(
      [],
      arraysOfEntriesToAdd
    );
    if (entriesToAdd.length > 0) {
      // actually add rows
      const rowsToAdd = entriesToAdd.map(
        questionEntryToCombinedQuestionSheetValueRow
      );
      const startRow = updatedCombinedQuestionEntries.length + 2;
      console.info(
        `Adding ${rowsToAdd.length} rows to the end of the sheet (row ${startRow})`
      );
      combinedQuestionsSheet
        .getRange(
          startRow,
          1,
          rowsToAdd.length,
          combinedQuestionsSheetHeaders.length
        )
        .setValues(rowsToAdd);
      newCombinedQuestionEntries = rowsToAdd.map(
        combinedQuestionsSheetValueRowToCombinedQuestionEntry
      );
      // Add to the array that tracks the current sheet entries
      updatedCombinedQuestionEntries = updatedCombinedQuestionEntries.concat(
        newCombinedQuestionEntries
      );
      console.info(
        `Added ${rowsToAdd.length} rows. The total amount of data rows is now ${updatedCombinedQuestionEntries.length}`
      );
    }
  }

  // Limit the amount of rows of the worksheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the combined questions worksheet to the amount of entries`
  );
  adjustSheetRowsAndColumnsCount(
    combinedQuestionsSheet,
    updatedCombinedQuestionEntries.length + 1,
    combinedQuestionsSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`End of refreshCombinedQuestionsSheetListing()`);
  /* tslint:enable:no-console */

  return { updatedCombinedQuestionEntries, newCombinedQuestionEntries };
}
