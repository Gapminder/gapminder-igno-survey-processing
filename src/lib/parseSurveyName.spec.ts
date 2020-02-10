import test, { ExecutionContext, Macro } from "ava";
import { parseSurveyName } from "./parseSurveyName";

/**
 * @hidden
 */
const testParseSurveyName: Macro<any> = (
  t: ExecutionContext,
  { surveyName, expectedOutput }
) => {
  const output = parseSurveyName(surveyName);
  // t.log({ output, expectedOutput });
  t.deepEqual(output, expectedOutput);
};

[
  /* tslint:disable:object-literal-sort-keys */
  {
    surveyName: "World Views 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: "123",
      countryViewsSurveyBatchNumber: false
    }
  },
  {
    surveyName: "Country Views 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: "123"
    }
  },
  {
    surveyName: "Foo 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: null,
      countryViewsSurveyBatchNumber: null
    }
  },
  {
    surveyName: "#N/A",
    expectedOutput: {
      worldViewsSurveyBatchNumber: null,
      countryViewsSurveyBatchNumber: null
    }
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test("testParseSurveyName - " + index, testParseSurveyName, testData);
});
