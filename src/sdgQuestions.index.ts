/**
 * This file is built and pushed to Google Scripts
 * using the source code and tools at https://github.com/Gapminder/gapminder-igno-survey-process-scripts
 * Note: Global functions must be exposed to the (global as any) object, or it will not be picked up by gas-webpack-plugin.
 */

// import AuthMode = GoogleAppsScript.Script.AuthMode; // Does not get stripped away, thus manually including below instead
/**
 * @hidden
 */
enum AuthMode {
  NONE,
  CUSTOM_FUNCTION,
  LIMITED,
  FULL
}
import Range = GoogleAppsScript.Spreadsheet.Range;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

/**
 * @hidden
 */
interface EditEvent {
  authMode: AuthMode;
  range: Range;
  source: Spreadsheet;
  user: string;
  value: any;
}

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {EditEvent} e The onEdit event.
 */
(global as any).onEdit = function onEdit(e: EditEvent) {
  console.log("onEdit", e);

  const range = e.range;

  console.log("range.getSheet()", range.getSheet());
  console.log(
    "range.getSheet().getSheetName()",
    range.getSheet().getSheetName()
  );
  console.log("range.getSheet().getName()", range.getSheet().getName());
  console.log(
    'range.getSheet().getRange("A1:1").getValues()',
    range
      .getSheet()
      .getRange("A1:1")
      .getValues()
  );

  console.log("range.getA1Notation()", range.getA1Notation());
  console.log("range.getValues()", range.getValues());
  console.log("range.getFormulas()", range.getFormulas());
};
