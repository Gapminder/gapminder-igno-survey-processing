export const surveyIdFromGoogleSurveysUrl = url => {
  return url.replace("https://surveys.google.com/reporting/survey?survey=", "");
};
