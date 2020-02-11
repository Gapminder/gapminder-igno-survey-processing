import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Blob = GoogleAppsScript.Base.Blob;
import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import groupBy from "lodash/groupBy";
import {
  CombinedQuestionEntry,
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetName,
  CombinedToplineEntry,
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  ImportedIgnoQuestionsInfoEntry,
  importedIgnoQuestionsInfoSheetHeaders,
  importedIgnoQuestionsInfoSheetName,
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import { answerOptionMatchesFactualAnswer } from "../lib/answerOptionMatchesFactualAnswer";
import { removeEmptyRowsAtTheEnd } from "../lib/cleanInputRange";
import { parseSurveyName } from "../lib/parseSurveyName";

/**
 * @hidden
 */
export const xlsxMimeType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * @hidden
 */
export const gsheetMimeType = "application/vnd.google-apps.spreadsheet";

/**
 * @hidden
 */
export function createSheet(spreadsheet, sheetName, sheetHeaders) {
  const sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  const headersRange = sheet.getRange(1, 1, 1, sheetHeaders.length);
  headersRange.setValues([sheetHeaders]);
  headersRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert(
    `No sheet named '${sheetName}' was found. It has now been added.`
  );
  return sheet;
}

/**
 * @hidden
 */
export function getSheetDataIncludingHeaderRow(sheet: Sheet, sheetHeaders) {
  const sheetDataIncludingHeaderRowRange = sheet.getRange(
    1,
    1,
    sheet.getDataRange().getNumRows(),
    sheetHeaders.length
  );
  return removeEmptyRowsAtTheEnd(
    sheetDataIncludingHeaderRowRange.getDisplayValues()
  );
}

/**
 * @hidden
 */
export function assertCorrectLeftmostSheetColumnHeaders(
  sheetHeaders,
  sheetName,
  sheetDataWithHeaderRow
) {
  const headerRow = sheetDataWithHeaderRow.slice(0, 1);
  const firstSheetHeaders = headerRow[0].slice(0, sheetHeaders.length);
  if (JSON.stringify(firstSheetHeaders) !== JSON.stringify(sheetHeaders)) {
    throw new Error(
      `Unexpected columns. The first column headers in '${sheetName}' must be ${JSON.stringify(
        sheetHeaders
      )} but are currently ${JSON.stringify(
        firstSheetHeaders
      )}. The scripts needs to be updated to expect the current columns or vice versa.`
    );
  }
}

/**
 * @hidden
 */
export function adjustSheetRowsAndColumnsCount(
  sheet: Sheet,
  desiredRowCount,
  desiredColumnCount
) {
  if (sheet.getMaxRows() > desiredRowCount) {
    sheet.deleteRows(desiredRowCount + 1, sheet.getMaxRows() - desiredRowCount);
  }
  if (sheet.getMaxColumns() > desiredColumnCount) {
    sheet.deleteColumns(
      desiredColumnCount + 1,
      sheet.getMaxColumns() - desiredColumnCount
    );
  }
  if (sheet.getMaxRows() < desiredRowCount) {
    sheet.insertRowsAfter(
      sheet.getMaxRows(),
      desiredRowCount - sheet.getMaxRows()
    );
  }
  if (sheet.getMaxColumns() < desiredColumnCount) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      desiredColumnCount - sheet.getMaxColumns()
    );
  }
}

/**
 * @hidden
 */
export function addGsheetConvertedVersionOfExcelFileToFolder(
  excelFile: File,
  folder: Folder,
  targetFileName: string
) {
  const blob: Blob = excelFile.getBlob();
  const fileId = excelFile.getId();
  // @ts-ignore
  const folderId = Drive.Files.get(fileId).parents[0].id;
  const resource = {
    mimeType: gsheetMimeType,
    parents: [{ id: folderId }],
    title: targetFileName
  };
  // @ts-ignore
  const createdFileDriveObject = Drive.Files.insert(resource, blob, {
    convert: true
  });
  const createdFile = DriveApp.getFileById(createdFileDriveObject.id);
  return createdFile;
}

/**
 * @hidden
 */
export function ensuredColumnIndex(headers, header: string) {
  const index = headers.indexOf(header);
  if (index < 0) {
    throw new Error(`Header not found: '${header}'`);
  }
  return index;
}

/**
 * @hidden
 */
export function getColumnValuesRange(sheet: Sheet, headers, header) {
  const columnIndex = ensuredColumnIndex(headers, header);
  return sheet.getRange(2, columnIndex + 1, sheet.getMaxRows() - 1, 1);
}

/**
 * @hidden
 */
export function fillColumnWithFormulas(
  sheet: Sheet,
  headers: string[],
  header: string,
  formulaInA1Notation: string,
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  console.info(`Filling formula column "${header}"`);
  /* tslint:enable:no-console */
  const columnIndex = ensuredColumnIndex(headers, header);
  const range = sheet.getRange(startRow, columnIndex + 1, numRows, 1);
  const formulas = arrayOfASingleValue(
    formulaInA1Notation,
    numRows
  ).map((formula, index) =>
    formula.split("[ROW]").join(String(index + startRow))
  );
  range.setFormulas(formulas.map(formula => [formula]));
}

/**
 * @hidden
 */
export function fillColumnWithValues(
  sheet: Sheet,
  headers: string[],
  header: string,
  valueCalculationCallback: (rowNumber: number) => any,
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  console.info(`Filling value column "${header}"`);
  /* tslint:enable:no-console */
  const columnIndex = ensuredColumnIndex(headers, header);
  const range = sheet.getRange(startRow, columnIndex + 1, numRows, 1);
  const values = arrayOfASingleValue(null, numRows).map((value, index) => {
    const rowNumber = index + startRow;
    return valueCalculationCallback(rowNumber);
  });
  range.setValues(values.map(value => [value]));
}

/**
 * @hidden
 */
export function arrayOfASingleValue(value, len): any[] {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(value);
  }
  return arr;
}

/**
 * From https://stackoverflow.com/a/43046408/682317
 * @hidden
 */
export function unique(ar) {
  const j = {};

  ar.forEach(v => {
    j[v + "::" + typeof v] = v;
  });

  return Object.keys(j).map(v => {
    return j[v];
  });
}

/**
 * @hidden
 */
export function fileNameToSurveyId(fileName) {
  return fileName.replace("survey-", "");
}

/**
 * @hidden
 */
const openedSpreadsheetsByIdMemoryCache = {};

/**
 * @hidden
 */
export function openSpreadsheetByIdAtMostOncePerScriptRun(id: string) {
  if (openedSpreadsheetsByIdMemoryCache[id]) {
    return openedSpreadsheetsByIdMemoryCache[id];
  }
  /* tslint:disable:no-console */
  console.info(`Opening Spreadsheet with id ${id}`);
  /* tslint:enable:no-console */
  openedSpreadsheetsByIdMemoryCache[id] = SpreadsheetApp.openById(id);
  return openedSpreadsheetsByIdMemoryCache[id];
}

/**
 * @hidden
 */
export function fetchAndVerifySurveysSheet(activeSpreadsheet: Spreadsheet) {
  let surveysSheet = activeSpreadsheet.getSheetByName(surveysSheetName);
  if (surveysSheet === null) {
    surveysSheet = createSheet(
      activeSpreadsheet,
      surveysSheetName,
      surveysSheetHeaders
    );
  }
  const surveysSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    surveysSheet,
    surveysSheetHeaders
  );
  // Verify that the first headers are as expected
  assertCorrectLeftmostSheetColumnHeaders(
    surveysSheetHeaders,
    surveysSheetName,
    surveysSheetValuesIncludingHeaderRow
  );
  return { surveysSheet, surveysSheetValuesIncludingHeaderRow };
}
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
export function fetchAndVerifyImportedIgnoQuestionsInfoSheet(
  activeSpreadsheet: Spreadsheet
) {
  const importedIgnoQuestionsInfoSheet = activeSpreadsheet.getSheetByName(
    importedIgnoQuestionsInfoSheetName
  );
  if (importedIgnoQuestionsInfoSheet === null) {
    throw new Error(
      `The required sheet "${importedIgnoQuestionsInfoSheetName}" is missing. Please add it and run this script again.`
    );
  }
  const importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow = getSheetDataIncludingHeaderRow(
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetHeaders
  );
  return {
    importedIgnoQuestionsInfoSheet,
    importedIgnoQuestionsInfoSheetValuesIncludingHeaderRow
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
  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
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
      if (combinedQuestionEntry.survey_name === "#N/A") {
        return `(No survey name available yet)`;
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
      if (combinedQuestionEntry.survey_name === "#N/A") {
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

/**
 * @hidden
 */
export function updateCombinedToplineSheetFormulasAndCalculatedColumns(
  combinedToplineSheet,
  combinedToplineEntries: CombinedToplineEntry[],
  combinedQuestionEntries: CombinedQuestionEntry[],
  importedIgnoQuestionsInfoEntries: ImportedIgnoQuestionsInfoEntry[],
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
            .answer_to_igno_index_question;
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
            .answer_to_foreign_country_igno_question;
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

  fillColumnWithFormulas(
    combinedToplineSheet,
    combinedToplineSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    startRow,
    numRows
  );

  console.info(
    `End of updateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );
  /* tslint:enable:no-console */
}

/**
 * @hidden
 */
const combineSurveyIdAndQuestionNumber = (
  combinedEntry: CombinedQuestionEntry | CombinedToplineEntry
) => {
  /* tslint:disable:no-console */
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
  /* tslint:enable:no-console */
  return `${combinedEntry.survey_id}-${combinedEntry.question_number}`;
};
