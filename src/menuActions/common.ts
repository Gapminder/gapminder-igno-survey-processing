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
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import { removeEmptyRowsAtTheEnd } from "../lib/cleanInputRange";

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
export function updateCombinedQuestionSheetFormulasAndCalculatedColumns(
  combinedQuestionsSheet,
  combinedQuestionEntries: CombinedQuestionEntry[],
  combinedToplineEntries: CombinedToplineEntry[],
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  console.info(
    `Start of updateCombinedQuestionSheetFormulasAndCalculatedColumns()`
  );

  console.info(`Filling formula columns`);
  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Survey Name",
    `=VLOOKUP("survey-"&A[ROW],{${surveysSheetName}!G$2:G,${surveysSheetName}!A$2:A},2,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Igno Index Question",
    `=VLOOKUP(E[ROW],imported_igno_questions_info!$A$3:$C,2,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Igno Index Question",
    `=VLOOKUP(E[ROW],imported_igno_questions_info!$A$3:$C,3,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Foreign Country Igno Question",
    `=VLOOKUP(G[ROW],imported_igno_questions_info!$D$3:$F,2,FALSE)`,
    startRow,
    numRows
  );

  fillColumnWithFormulas(
    combinedQuestionsSheet,
    combinedQuestionsSheetHeaders,
    "Answer to Foreign Country Igno Question",
    `=VLOOKUP(G[ROW],imported_igno_questions_info!$D$3:$Fs,3,FALSE)`,
    startRow,
    numRows
  );

  const combineSurveyIdAndQuestionNumber = (
    combinedEntry: CombinedQuestionEntry | CombinedToplineEntry
  ) => {
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
  startRow: number,
  numRows: number
) {
  /* tslint:disable:no-console */
  console.info(
    `Start of updateCombinedToplineSheetFormulasAndCalculatedColumns()`
  );

  console.info(`Filling formula columns`);
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
