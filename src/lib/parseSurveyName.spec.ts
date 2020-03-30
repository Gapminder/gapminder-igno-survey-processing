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
      countryViewsSurveyBatchNumber: false,
      studySurveyBatchNumber: false
    }
  },
  {
    surveyName: "Country Views 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: "123",
      studySurveyBatchNumber: false
    }
  },
  {
    surveyName: "Study Survey 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: false,
      studySurveyBatchNumber: "123"
    }
  },
  {
    surveyName: "Foo 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: null,
      countryViewsSurveyBatchNumber: null,
      studySurveyBatchNumber: null
    }
  },
  {
    surveyName: "#N/A",
    expectedOutput: {
      worldViewsSurveyBatchNumber: null,
      countryViewsSurveyBatchNumber: null,
      studySurveyBatchNumber: null
    }
  },
  {
    surveyName: "Country Views 383",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: "383",
      studySurveyBatchNumber: "1/c383"
    }
  },
  {
    surveyName: "Country Views 384",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: "384",
      studySurveyBatchNumber: "2/c384"
    }
  },
  {
    surveyName: "Country Views 385",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: "385",
      studySurveyBatchNumber: "3/c385"
    }
  },
  {
    surveyName: "Study 123",
    expectedOutput: {
      worldViewsSurveyBatchNumber: false,
      countryViewsSurveyBatchNumber: false,
      studySurveyBatchNumber: "123"
    }
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test("testParseSurveyName - " + index, testParseSurveyName, testData);
});
