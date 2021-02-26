import test, { ExecutionContext, Macro } from "ava";
import { surveyIdFromGoogleSurveysUrl } from "./surveyIdFromGoogleSurveysUrl";

/**
 * @hidden
 */
const testSurveyIdFromGoogleSurveysUrl: Macro<any> = (
  t: ExecutionContext,
  { url, expected }
) => {
  const output = surveyIdFromGoogleSurveysUrl(url);
  t.log({ output, expected });
  t.deepEqual(output, expected);
};

[
  /* tslint:disable:object-literal-sort-keys */
  {
    url:
      "https://surveys.google.com/reporting/survey?survey=4s77dfg2vvn7em2ja5uho75cfu",
    expected: "4s77dfg2vvn7em2ja5uho75cfu"
  },
  {
    url:
      "https://surveys.google.com/reporting/survey?survey=4s77dfg2vvn7em2ja5uho75cfu&org=personal",
    expected: "4s77dfg2vvn7em2ja5uho75cfu"
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test(
    "testSurveyIdFromGoogleSurveysUrl - " + index,
    testSurveyIdFromGoogleSurveysUrl,
    testData
  );
});
