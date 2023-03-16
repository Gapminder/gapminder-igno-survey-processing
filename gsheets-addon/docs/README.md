
# Gapminder Igno Survey Process Scripts

## Index

### Classes

* [AlreadyRunningException](classes/alreadyrunningexception.md)
* [UrlFetchAppFetchException](classes/urlfetchappfetchexception.md)

### Functions

* [errorHandlingFetch](README.md#const-errorhandlingfetch)
* [invokeGcpCloudFunction](README.md#invokegcpcloudfunction)
* [menuRefreshSurveysAndCombinedListings](README.md#menurefreshsurveysandcombinedlistings)
* [mutex](README.md#mutex)
* [refreshSurveysAndCombinedListingsCloudFunction](README.md#refreshsurveysandcombinedlistingscloudfunction)

## Functions

### `Const` errorHandlingFetch

▸ **errorHandlingFetch**(`url`: string, `params?`: URLFetchRequestOptions): *HTTPResponse*

*Defined in [src/lib/errorHandlingFetch.ts:25](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/errorHandlingFetch.ts#L25)*

To get exceptions thrown when requests fail

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`params?` | URLFetchRequestOptions |

**Returns:** *HTTPResponse*

___

###  invokeGcpCloudFunction

▸ **invokeGcpCloudFunction**(`gcpRegion`: string, `gcpProject`: string, `cloudFunction`: string): *string*

*Defined in [src/lib/invokeGcpCloudFunction.ts:3](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/invokeGcpCloudFunction.ts#L3)*

**Parameters:**

Name | Type |
------ | ------ |
`gcpRegion` | string |
`gcpProject` | string |
`cloudFunction` | string |

**Returns:** *string*

___

###  menuRefreshSurveysAndCombinedListings

▸ **menuRefreshSurveysAndCombinedListings**(): *void*

*Defined in [src/menuActions/menuRefreshSurveysAndCombinedListings.ts:26](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/menuActions/menuRefreshSurveysAndCombinedListings.ts#L26)*

Menu item action for "Gapminder Igno Survey Process -> Refresh surveys and combined topline listings"

Notes:
- Creates the `surveys` and `topline_combo` worksheets if they don't exist
- Verifies that the first headers of the `surveys` and `topline_combo` worksheets are as expected

**Returns:** *void*

___

###  mutex

▸ **mutex**<**T**, **R**>(`functionReference`: string, `callable`: T, `lockDurationInSeconds`: number): *R*

*Defined in [src/lib/mutex.ts:16](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/mutex.ts#L16)*

**Type parameters:**

▪ **T**: *CallableFunction*

▪ **R**

**Parameters:**

Name | Type |
------ | ------ |
`functionReference` | string |
`callable` | T |
`lockDurationInSeconds` | number |

**Returns:** *R*

___

###  refreshSurveysAndCombinedListingsCloudFunction

▸ **refreshSurveysAndCombinedListingsCloudFunction**(): *string*

*Defined in [src/menuActions/menuRefreshSurveysAndCombinedListings.ts:4](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/menuActions/menuRefreshSurveysAndCombinedListings.ts#L4)*

**Returns:** *string*
