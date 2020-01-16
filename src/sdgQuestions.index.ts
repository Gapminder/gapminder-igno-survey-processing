/**
 * This file is built and pushed to Google Scripts
 * using the source code and tools at https://github.com/Gapminder/gapminder-igno-survey-process-scripts
 * Note: Global functions must be exposed to the (global as any) object, or it will not be picked up by gas-webpack-plugin.
 */

import AuthMode = GoogleAppsScript.Script.AuthMode;
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
(global as any).onOpen = function onEdit(e: EditEvent) {
  // Set a comment on the edited cell to indicate when it was changed.
  const range = e.range;
  // range.setNote('Last modified: ' + new Date());
  console.log("onEdit", e);
};
