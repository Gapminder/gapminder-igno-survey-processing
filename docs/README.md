
# Gapminder Igno Survey Process Scripts

## Index

### Functions

* [menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames](README.md#menuextractsurveyidsfromcopypastedlinkedsurveynames)
* [menuRefreshSurveysAndCombinedListings](README.md#menurefreshsurveysandcombinedlistings)

## Functions

###  menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames

▸ **menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames**(): *void*

*Defined in [menuActions/menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames.ts:17](https://github.com/Gapminder/gapminder-igno-survey-process-scripts/blob/v0.2.0/src/menuActions/menuExtractSurveyIdsFromCopyPastedLinkedSurveyNames.ts#L17)*

Menu item action for "Gapminder Igno Survey Process -> Extract Survey IDs from copy-pasted linked survey names"

**Returns:** *void*

___

###  menuRefreshSurveysAndCombinedListings

▸ **menuRefreshSurveysAndCombinedListings**(): *void*

*Defined in [menuActions/menuRefreshSurveysAndCombinedListings.ts:31](https://github.com/Gapminder/gapminder-igno-survey-process-scripts/blob/v0.2.0/src/menuActions/menuRefreshSurveysAndCombinedListings.ts#L31)*

Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"

Notes:
- Creates the `surveys` and `topline_combo` worksheets if they don't exist
- Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected

**Returns:** *void*
