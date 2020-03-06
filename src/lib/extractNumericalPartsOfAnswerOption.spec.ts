import test, { ExecutionContext, Macro } from "ava";
import { extractNumericalPartsOfAnswerOption } from "./extractNumericalPartsOfAnswerOption";

/**
 * @hidden
 */
const testExtractNumericalPartsOfAnswerOption: Macro<any> = (
  t: ExecutionContext,
  { answerOption, expectedOutput }
) => {
  const output = extractNumericalPartsOfAnswerOption(answerOption);
  // t.log({ answerOption, output, expectedOutput });
  t.deepEqual(output, expectedOutput);
};

[
  /* tslint:disable:object-literal-sort-keys */
  {
    answerOption: false,
    expectedOutput: []
  },
  {
    answerOption: true,
    expectedOutput: []
  },
  {
    answerOption: undefined,
    expectedOutput: []
  },
  {
    answerOption: null,
    expectedOutput: []
  },
  {
    answerOption: "",
    expectedOutput: []
  },
  {
    answerOption: 1,
    expectedOutput: [1]
  },
  {
    answerOption: 1.1,
    expectedOutput: [1.1]
  },
  {
    answerOption: "1",
    expectedOutput: [1]
  },
  {
    answerOption: "1.1",
    expectedOutput: [1.1]
  },
  {
    answerOption: "1%",
    expectedOutput: [1]
  },
  {
    answerOption: "-1.1",
    expectedOutput: [-1.1]
  },
  {
    answerOption: "-1%",
    expectedOutput: [-1]
  },
  {
    answerOption: "1-1.1",
    expectedOutput: [1, 1.1]
  },
  {
    answerOption: "1-2%",
    expectedOutput: [1, 2]
  },
  {
    answerOption: "Abc",
    expectedOutput: []
  },
  {
    answerOption: "14 pounds",
    expectedOutput: [14]
  },
  {
    answerOption: "Yes",
    expectedOutput: []
  },
  {
    answerOption: "30-40%",
    expectedOutput: [30, 40]
  },
  {
    answerOption: "20-30%",
    expectedOutput: [20, 30]
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test(
    "testExtractNumericalPartsOfAnswerOption - " + index,
    testExtractNumericalPartsOfAnswerOption,
    testData
  );
});
