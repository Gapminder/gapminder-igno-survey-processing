/**
 * @hidden
 */
type BatchNumberParseResult = string | null | false;

/**
 * @hidden
 */
export function parseSurveyName(
  surveyName: string
): {
  worldViewsSurveyBatchNumber: BatchNumberParseResult;
  countryViewsSurveyBatchNumber: BatchNumberParseResult;
  studySurveyBatchNumber: BatchNumberParseResult;
} {
  const worldViewsTextFound = surveyName.indexOf("World Views ") > -1;
  const countryViewsTextFound = surveyName.indexOf("Country Views ") > -1;
  const studySurveyTextFound = surveyName.indexOf("Study Survey ") > -1;
  let worldViewsSurveyBatchNumber: BatchNumberParseResult = worldViewsTextFound
    ? surveyName.trim().replace("World Views ", "")
    : false;
  let countryViewsSurveyBatchNumber: BatchNumberParseResult = countryViewsTextFound
    ? surveyName.trim().replace("Country Views ", "")
    : false;
  let studySurveyBatchNumber: BatchNumberParseResult = studySurveyTextFound
    ? surveyName.trim().replace("Study Survey ", "")
    : false;
  // Some special cases
  if (countryViewsSurveyBatchNumber === "383") {
    studySurveyBatchNumber = "1/c383";
  }
  if (countryViewsSurveyBatchNumber === "384") {
    studySurveyBatchNumber = "2/c384";
  }
  if (countryViewsSurveyBatchNumber === "385") {
    studySurveyBatchNumber = "3/c385";
  }
  // Return nulls in case nothing was found at all
  if (
    worldViewsSurveyBatchNumber === false &&
    countryViewsSurveyBatchNumber === false &&
    studySurveyBatchNumber === false
  ) {
    worldViewsSurveyBatchNumber = null;
    countryViewsSurveyBatchNumber = null;
    studySurveyBatchNumber = null;
  }
  return {
    countryViewsSurveyBatchNumber,
    studySurveyBatchNumber,
    worldViewsSurveyBatchNumber
  };
}
