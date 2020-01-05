import { removeEmptyRowsAtTheEnd } from "../lib/cleanInputRange";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

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
  return removeEmptyRowsAtTheEnd(sheetDataIncludingHeaderRowRange.getValues());
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
    SpreadsheetApp.getUi().alert(
      `The first column sheetHeaders in '${sheetName}' must be ${JSON.stringify(
        sheetHeaders
      )} but are currently ${JSON.stringify(
        firstSheetHeaders
      )}. Please adjust and try again`
    );
    return false;
  }
  return true;
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
