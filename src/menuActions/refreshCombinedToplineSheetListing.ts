import difference from "lodash/difference";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import File = GoogleAppsScript.Drive.File;
import intersection from "lodash/intersection";
import union from "lodash/union";
import {
  CombinedToplineEntry,
  combinedToplineEntryToCombinedToplineSheetValueRow,
  combinedToplineSheetHeaders,
  combinedToplineSheetValueRowToCombinedToplineEntry,
  surveysSheetValueRowToSurveyEntry,
  ToplineEntry,
  toplineEntryToCombinedToplineSheetValueRow,
  toplineSheetValueRowToToplineEntry
} from "../gsheetsData/hardcodedConstants";
import {
  adjustSheetRowsAndColumnsCount,
  fileNameToSurveyId,
  openSpreadsheetByIdAtMostOncePerScriptRun,
  updateCombinedToplineSheetFormulasAndCalculatedColumns
} from "./common";

/**
 * @hidden
 */
export function refreshCombinedToplineSheetListing(
  updatedSurveysSheetValues: any[][],
  combinedToplineSheet: Sheet,
  combinedToplineSheetValuesIncludingHeaderRow: any[][],
  gsResultsFolderGsheetFiles: File[]
) {
  /* tslint:disable:no-console */
  console.info(`Start of refreshCombinedToplineSheetListing()`);

  let updatedCombinedToplineEntries;

  // From the existing sheet contents, purge entries that does not have an entry in the surveys sheet
  // so that the combined topline listing only contains rows that are relevant for analysis
  console.info(`Checking for orphaned rows in the combined topline listing`);
  const combinedToplineSheetValues = combinedToplineSheetValuesIncludingHeaderRow.slice(
    1
  );
  const existingSurveyEntries = updatedSurveysSheetValues.map(
    surveysSheetValueRowToSurveyEntry
  );
  const existingToplineEntries = combinedToplineSheetValues.map(
    combinedToplineSheetValueRowToCombinedToplineEntry
  );
  const existingSurveysSurveyIds = existingSurveyEntries.map(
    existingSurveyEntry => fileNameToSurveyId(existingSurveyEntry.file_name)
  );
  const existingToplineSurveyIds = union(
    existingToplineEntries.map(
      existingToplineEntry => existingToplineEntry.survey_id
    )
  );

  const surveyIdsInBothListings = intersection(
    existingSurveysSurveyIds,
    existingToplineSurveyIds
  );

  const toplineEntriesWithSurveyEntry = existingToplineEntries.filter(
    toplineEntry => surveyIdsInBothListings.includes(toplineEntry.survey_id)
  );

  // Remove orphaned rows in the combined topline listing if necessary
  if (
    toplineEntriesWithSurveyEntry.length < combinedToplineSheetValues.length
  ) {
    console.info(`Removing orphaned rows in the combined topline listing`);
    // If we ended up with less rows than what already exists, clear all rows except the header row
    // so that we do not keep old rows hanging around
    console.info(`Clearing all rows except the header row`);
    combinedToplineSheet
      .getRange(
        2,
        1,
        combinedToplineSheetValuesIncludingHeaderRow.length,
        combinedToplineSheetValuesIncludingHeaderRow[0].length
      )
      .clearContent();
    if (toplineEntriesWithSurveyEntry.length > 0) {
      console.info(`Writing back the non-orphaned rows`);
      combinedToplineSheet
        .getRange(
          2,
          1,
          toplineEntriesWithSurveyEntry.length,
          combinedToplineSheetValuesIncludingHeaderRow[0].length
        )
        .setValues(
          toplineEntriesWithSurveyEntry.map(
            combinedToplineEntryToCombinedToplineSheetValueRow
          )
        );
    }
    updatedCombinedToplineEntries = toplineEntriesWithSurveyEntry;
  } else {
    updatedCombinedToplineEntries = existingToplineEntries;
  }

  console.info(
    `Finding which gsheet files are not-yet-included in the combined topline listing`
  );
  const gsResultsFolderGsheetFilesSurveyIds = union(
    gsResultsFolderGsheetFiles.map(gsResultsFolderGsheetFile =>
      fileNameToSurveyId(gsResultsFolderGsheetFile.getName())
    )
  );
  const notYetIncludedGsResultsFolderGsheetFilesSurveyIds = difference(
    gsResultsFolderGsheetFilesSurveyIds,
    existingToplineSurveyIds
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
        const sourceSheet = gsResultsFolderGsheet.getSheetByName("Topline");
        const sourceDataRange = sourceSheet.getDataRange();
        const sourceValuesIncludingHeaderRow = sourceDataRange.getDisplayValues();
        // const sourceHeaderRows = sourceValuesIncludingHeaderRow.slice(0, 1);
        const sourceValues = sourceValuesIncludingHeaderRow.slice(1);
        const targetEntries = sourceValues.map(
          toplineSheetValueRowToToplineEntry
        );
        console.info(
          `Read ${
            targetEntries.length
          } rows from spreadsheet with id ${gsResultsFolderGsheetFile.getId()}`
        );
        return targetEntries;
      }
    );
    // flatten
    const entriesToAdd: ToplineEntry[] = [].concat.apply(
      [],
      arraysOfEntriesToAdd
    );
    // actually add rows
    const rowsToAdd = entriesToAdd.map(
      toplineEntryToCombinedToplineSheetValueRow
    );
    const startRow = updatedCombinedToplineEntries.length + 2;
    console.info(
      `Adding ${rowsToAdd.length} rows to the end of the sheet (row ${startRow})`
    );
    combinedToplineSheet
      .getRange(
        startRow,
        1,
        rowsToAdd.length,
        combinedToplineSheetHeaders.length
      )
      .setValues(rowsToAdd);
    const correspondingNewCombinedToplineEntries: CombinedToplineEntry[] = rowsToAdd.map(
      combinedToplineSheetValueRowToCombinedToplineEntry
    );
    // Add to the array that tracks the current sheet entries
    updatedCombinedToplineEntries = updatedCombinedToplineEntries.concat(
      correspondingNewCombinedToplineEntries
    );
    console.info(
      `Added ${rowsToAdd.length} rows. The total amount of data rows is now ${updatedCombinedToplineEntries.length}`
    );
    console.info(`Updating formulas and calculated columns for the new rows`);
    updateCombinedToplineSheetFormulasAndCalculatedColumns(
      combinedToplineSheet,
      updatedCombinedToplineEntries.length -
        correspondingNewCombinedToplineEntries.length +
        2,
      entriesToAdd.length
    );
  }

  // Limit the amount of rows of the worksheet to the amount of entries
  console.info(
    `Limiting the amount of rows of the combined topline worksheet to the amount of entries`
  );
  adjustSheetRowsAndColumnsCount(
    combinedToplineSheet,
    updatedCombinedToplineEntries.length + 1,
    combinedToplineSheetValuesIncludingHeaderRow[0].length
  );

  console.info(`End of refreshCombinedToplineSheetListing()`);
  /* tslint:enable:no-console */

  return { updatedCombinedToplineEntries };
}
