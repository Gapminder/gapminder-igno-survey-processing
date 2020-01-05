/**
 * This file is built and pushed to Google Scripts
 * using the source code and tools at https://github.com/Gapminder/gapminder-igno-survey-process-scripts
 * Note: Global functions must be exposed to the (global as any) object, or it will not be picked up by gas-webpack-plugin.
 */

import { menuRefreshCombinedToplineListing } from "./menuActions/menuRefreshCombinedToplineListing";

/* tslint:disable:only-arrow-functions */

// Configure custom menus

(global as any).onOpen = function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Gapminder Igno Survey Process");
  menu.addItem(
    `Refresh combined topline listing`,
    "menuRefreshCombinedToplineListing"
  );
  menu.addToUi();
};

(global as any).menuRefreshCombinedToplineListing = menuRefreshCombinedToplineListing;
