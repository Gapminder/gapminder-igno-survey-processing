import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Blob = GoogleAppsScript.Base.Blob;
import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import {
  combinedQuestionsSheetHeaders,
  combinedQuestionsSheetName,
  combinedToplineSheetHeaders,
  combinedToplineSheetName,
  surveysSheetHeaders,
  surveysSheetName
} from "../gsheetsData/hardcodedConstants";
import { removeEmptyRowsAtTheEnd } from "../lib/cleanInputRange";
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

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
  rowCount: number
) {
  /* tslint:disable:no-console */
  console.info(`Filling formula column "${header}"`);
  /* tslint:enable:no-console */
  const columnIndex = ensuredColumnIndex(headers, header);
  const range = sheet.getRange(2, columnIndex + 1, rowCount, 1);
  const formulas = arrayOfASingleValue(
    formulaInA1Notation,
    rowCount
  ).map((formula, index) => formula.split("[ROW]").join(index + 2));
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
  rowCount: number
) {
  /* tslint:disable:no-console */
  console.info(`Filling value column "${header}"`);
  /* tslint:enable:no-console */
  const columnIndex = ensuredColumnIndex(headers, header);
  const range = sheet.getRange(2, columnIndex + 1, rowCount, 1);
  const values = arrayOfASingleValue(null, rowCount).map((value, index) => {
    const rowNumber = index + 2;
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
