
# Gapminder Igno Survey Process Scripts

## Index

### Functions

* [menuRefreshCombinedToplineListing](README.md#menurefreshcombinedtoplinelisting)

## Functions

###  menuRefreshCombinedToplineListing

▸ **menuRefreshCombinedToplineListing**(): *void*

*Defined in [menuActions/menuRefreshCombinedToplineListing.ts:21](https://github.com/Gapminder/gapminder-igno-survey-process-scripts/blob/v0.0.0/src/menuActions/menuRefreshCombinedToplineListing.ts#L21)*

Menu item action for "Gapminder Igno Survey Process -> Refresh combined topline listing"

Notes:
- Creates the `surveys` and `topline_combo` worksheets if they don't exist
- Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected

**Returns:** *void*
