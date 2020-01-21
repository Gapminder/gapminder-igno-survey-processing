
# Gapminder Igno Survey Process Scripts

## Index

### Functions

* [menuRefreshSurveysAndCombinedListings](README.md#menurefreshsurveysandcombinedlistings)

## Functions

###  menuRefreshSurveysAndCombinedListings

▸ **menuRefreshSurveysAndCombinedListings**(): *void*

*Defined in [menuActions/menuRefreshSurveysAndCombinedListings.ts:46](https://github.com/Gapminder/gapminder-igno-survey-process-scripts/blob/v0.1.0/src/menuActions/menuRefreshSurveysAndCombinedListings.ts#L46)*

Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"

Notes:
- Creates the `surveys` and `topline_combo` worksheets if they don't exist
- Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected

**Returns:** *void*
