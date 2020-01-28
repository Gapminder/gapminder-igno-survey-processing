/**
 * This file is built and pushed to Google Scripts
 * using the source code and tools at https://github.com/Gapminder/gapminder-igno-survey-process-scripts
 * Note: Global functions must be exposed to the (global as any) object, or it will not be picked up by gas-webpack-plugin.
 */

import { menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames } from "./menuActions/menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames";
import { menuRefreshSurveysAndCombinedListings } from "./menuActions/menuRefreshSurveysAndCombinedListings";

/* tslint:disable:only-arrow-functions */

// Configure custom menus

(global as any).onOpen = function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Gapminder Igno Survey Process");
  menu.addItem(
    `Refresh surveys and combined listings`,
    "menuRefreshSurveysAndCombinedListings"
  );
  menu.addItem(
    `Extract Survey IDs from copy-pasted linked survey names`,
    "menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames"
  );
  menu.addToUi();
};

(global as any).menuRefreshSurveysAndCombinedListings = menuRefreshSurveysAndCombinedListings;

(global as any).menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames = menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames;
