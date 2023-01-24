import "url-search-params-polyfill";

/**
 * @hidden
 */
export const surveyIdFromGoogleSurveysUrl = gsUrl => {
  // @ts-ignore
  const searchParams = new URLSearchParams(
    gsUrl.replace("https://surveys.google.com/reporting/survey?", "")
  );
  return searchParams.get("survey");
};
