import test, { ExecutionContext, Macro } from "ava";
import { chosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer } from "./chosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer";

/**
 * @hidden
 */
const testChosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer: Macro<any> = (
  t: ExecutionContext,
  { answerOption, answerOptions, factualAnswer, expectedOutput }
) => {
  const output = chosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer(
    answerOption,
    answerOptions,
    factualAnswer
  );
  // t.log({ answerOption, answerOptions, factualAnswer, output, expectedOutput });
  t.deepEqual(output, expectedOutput);
};

[
  /* tslint:disable:object-literal-sort-keys */
  {
    answerOption: "1",
    answerOptions: ["1", "2", "3"],
    factualAnswer: "1",
    expectedOutput: 0
  },
  {
    answerOption: "1",
    answerOptions: ["1", "2", "3"],
    factualAnswer: "2",
    expectedOutput: 1
  },
  {
    answerOption: "1",
    answerOptions: ["1", "2", "3"],
    factualAnswer: "3",
    expectedOutput: 2
  },
  {
    answerOption: "2",
    answerOptions: ["1", "2", "3"],
    factualAnswer: "1",
    expectedOutput: 1
  },
  {
    answerOption: "3",
    answerOptions: ["1", "2", "3"],
    factualAnswer: "1",
    expectedOutput: 2
  },
  {
    answerOption: "10-20%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "15%",
    expectedOutput: 0
  },
  {
    answerOption: "10-20%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "25%",
    expectedOutput: 1
  },
  {
    answerOption: "10-20%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "35%",
    expectedOutput: 2
  },
  {
    answerOption: "20-30%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "15%",
    expectedOutput: 1
  },
  {
    answerOption: "30-40%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "15%",
    expectedOutput: 2
  },
  {
    answerOption: "20-30%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "30%",
    expectedOutput: 0
  },
  {
    answerOption: "10-20%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "30%",
    expectedOutput: 1
  },
  {
    answerOption: "30-40%",
    answerOptions: ["10-20%", "20-30%", "30-40%"],
    factualAnswer: "30%",
    expectedOutput: 0
  },
  {
    answerOption: "7",
    answerOptions: ["1", "2", "3", "4", "5", "6", "7"],
    factualAnswer: "1",
    expectedOutput: 6
  },
  {
    answerOption: "43%",
    answerOptions: ["3%", "23%", "43%"],
    factualAnswer: "3%",
    expectedOutput: 2
  },
  {
    answerOption: "$50 billion",
    answerOptions: ["$10 billion", "$30 billion", "$50 billion"],
    factualAnswer: "$10 billion",
    expectedOutput: 2
  }
  /* tslint:enable:object-literal-sort-keys */
].forEach((testData, index) => {
  test(
    "testChosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer - " +
      index,
    testChosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer,
    testData
  );
});
