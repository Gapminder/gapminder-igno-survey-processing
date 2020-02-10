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
  t.log({ output, expectedOutput });
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
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test(
    "testAnswerOptionMatchesFactualAnswer - " + index,
    testAnswerOptionMatchesFactualAnswer,
    testData
  );
});
