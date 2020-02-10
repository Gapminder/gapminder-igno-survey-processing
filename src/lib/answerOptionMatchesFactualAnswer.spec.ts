import test, { ExecutionContext, Macro } from "ava";
import { answerOptionMatchesFactualAnswer } from "./answerOptionMatchesFactualAnswer";

/**
 * @hidden
 */
const testAnswerOptionMatchesFactualAnswer: Macro<any> = (
  t: ExecutionContext,
  { answerOption, factualAnswer, expectedOutput }
) => {
  const output = answerOptionMatchesFactualAnswer(answerOption, factualAnswer);
  // t.log({ answerOption, factualAnswer, output, expectedOutput });
  t.deepEqual(output, expectedOutput);
};

[
  /* tslint:disable:object-literal-sort-keys */
  {
    answerOption: "1%",
    factualAnswer: "1%",
    expectedOutput: true
  },
  {
    answerOption: "1%",
    factualAnswer: "1% ",
    expectedOutput: true
  },
  {
    answerOption: "30-40%",
    factualAnswer: "24%",
    expectedOutput: false
  },
  {
    answerOption: "30-40%",
    factualAnswer: "34%",
    expectedOutput: true
  },
  {
    answerOption: "30-40%",
    factualAnswer: "44%",
    expectedOutput: false
  },
  {
    answerOption: "30-40%",
    factualAnswer: "30%",
    expectedOutput: true
  },
  {
    answerOption: "30-40%",
    factualAnswer: "40%",
    expectedOutput: true
  },
  {
    answerOption: "30-40%",
    factualAnswer: "20%",
    expectedOutput: false
  },
  {
    answerOption: "20-30%",
    factualAnswer: "30%",
    expectedOutput: true
  },
  {
    answerOption: "20-30%",
    factualAnswer: "30.0%",
    expectedOutput: true
  },
  {
    answerOption: "20-30%",
    factualAnswer: "29.9%",
    expectedOutput: true
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test(
    "testAnswerOptionMatchesFactualAnswer - " + index,
    testAnswerOptionMatchesFactualAnswer,
    testData
  );
});
