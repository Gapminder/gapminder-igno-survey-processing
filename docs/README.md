
# Gapminder Igno Survey Process Scripts

## Index

### Functions

* [menuRefreshSurveysAndCombinedToplineListings](README.md#menurefreshsurveysandcombinedtoplinelistings)

## Functions

###  menuRefreshSurveysAndCombinedToplineListings

▸ **menuRefreshSurveysAndCombinedToplineListings**(): *void*

*Defined in [menuActions/menuRefreshSurveysAndCombinedToplineListings.ts:37](https://github.com/Gapminder/gapminder-igno-survey-process-scripts/blob/v0.0.0/src/menuActions/menuRefreshSurveysAndCombinedToplineListings.ts#L37)*

Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"

Notes:
- Creates the `surveys` and `topline_combo` worksheets if they don't exist
- Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected

**Returns:** *void*
