/**
 * @hidden
 */
export function parseSurveyName(
  surveyName: string
): {
  worldViewsSurveyBatchNumber: string | null | false;
  countryViewsSurveyBatchNumber: string | null | false;
} {
  const worldViewsTextFound = surveyName.indexOf("World Views ") > -1;
  const countryViewsTextFound = surveyName.indexOf("Country Views ") > -1;
  const worldViewsSurveyBatchNumber = worldViewsTextFound
    ? surveyName.trim().replace("World Views ", "")
    : countryViewsTextFound
    ? false
    : null;
  const countryViewsSurveyBatchNumber = countryViewsTextFound
    ? surveyName.trim().replace("Country Views ", "")
    : worldViewsTextFound
    ? false
    : null;
  return { worldViewsSurveyBatchNumber, countryViewsSurveyBatchNumber };
}
