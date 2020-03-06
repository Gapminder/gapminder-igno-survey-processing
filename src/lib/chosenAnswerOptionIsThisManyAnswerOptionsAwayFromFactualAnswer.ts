import { answerOptionMatchesFactualAnswer } from "./answerOptionMatchesFactualAnswer";
import { extractNumericalPartsOfAnswerOption } from "./extractNumericalPartsOfAnswerOption";

/**
 * @hidden
 */
export function chosenAnswerOptionIsThisManyAnswerOptionsAwayFromFactualAnswer(
  chosenAnswerOptions: string,
  answerOptions: string[],
  factualAnswer: string
): number {
  chosenAnswerOptions = chosenAnswerOptions.trim().toLocaleLowerCase();
  factualAnswer = factualAnswer.trim().toLocaleLowerCase();

  if (answerOptions.length === 0) {
    throw new Error("Empty answerOptions array given");
  }

  if (answerOptions.length === 1) {
    throw new Error("Only one answer option given");
  }

  // Find correct answer option
  const correctAnswerOptions = answerOptions.filter($answerOption =>
    answerOptionMatchesFactualAnswer($answerOption, factualAnswer)
  );
  if (correctAnswerOptions.length === 0) {
    throw new Error("No correct answer option found");
  }

  // If the chosen answer option is a correct answer option, return 0
  if (correctAnswerOptions.indexOf(chosenAnswerOptions) > -1) {
    return 0;
  }

  // Double-check that all answer options are numerical (either integers, floats, percentages or ranges of such
  const numericalPartsOfAnswerOptions = answerOptions.map(
    extractNumericalPartsOfAnswerOption
  );
  const numericalAnswerOptions = numericalPartsOfAnswerOptions.filter(
    numericalPartsOfAnswerOption => numericalPartsOfAnswerOption.length > 0
  );
  if (numericalAnswerOptions.length !== answerOptions.length) {
    throw new Error("Answer options not all numerical");
  }

  // console.log({ numericalPartsOfAnswerOptions });

  const minimumNumbericalPartOfAnswerOption = (
    numericalPartsOfAnswerOption: number[]
  ) => Math.min(...numericalPartsOfAnswerOption);

  // Order by min(numerics)
  const sortedMinimumsOfNumericalPartsOfAnswerOptions: number[] = numericalPartsOfAnswerOptions
    .map(minimumNumbericalPartOfAnswerOption)
    .sort((a, b) => a - b);

  // console.log({ sortedMinimumsOfNumericalPartsOfAnswerOptions });

  // Compare with the other arguments
  const minimumOfNumericalPartsOfChosenAnswerOption = minimumNumbericalPartOfAnswerOption(
    extractNumericalPartsOfAnswerOption(chosenAnswerOptions)
  );

  const minimumsOfNumericalPartsOfCorrectAnswerOptions = correctAnswerOptions
    .map(extractNumericalPartsOfAnswerOption)
    .map(minimumNumbericalPartOfAnswerOption);
  // console.log({minimumOfNumericalPartsOfChosenAnswerOption,minimumsOfNumericalPartsOfCorrectAnswerOptions});

  const chosenAnswerOptionIsThisManyAnswerOptionsAwayFromCorrectAnswers = minimumsOfNumericalPartsOfCorrectAnswerOptions.map(
    minimumsOfNumericalPartsOfCorrectAnswerOption => {
      return Math.abs(
        sortedMinimumsOfNumericalPartsOfAnswerOptions.indexOf(
          minimumsOfNumericalPartsOfCorrectAnswerOption
        ) -
          sortedMinimumsOfNumericalPartsOfAnswerOptions.indexOf(
            minimumOfNumericalPartsOfChosenAnswerOption
          )
      );
    }
  );

  // console.log({ chosenAnswerOptionIsThisManyAnswerOptionsAwayFromCorrectAnswers });

  return Math.min(
    ...chosenAnswerOptionIsThisManyAnswerOptionsAwayFromCorrectAnswers
  );
}
