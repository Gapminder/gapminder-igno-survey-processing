import { extractNumericalPartsOfAnswerOption } from "./extractNumericalPartsOfAnswerOption";
import { keyNormalizerForSlightlyFuzzyLookups } from "./keyNormalizerForSlightlyFuzzyLookups";

/**
 * @hidden
 */
export function answerOptionMatchesFactualAnswer(
  answerOption: string,
  factualAnswer: string
): boolean {
  return (
    answerOptionIsTheSameAsFactualAnswer(answerOption, factualAnswer) ||
    answerOptionMatchesFactualAnswerNumerically(answerOption, factualAnswer)
  );
}

/**
 * @hidden
 */
export function answerOptionIsTheSameAsFactualAnswer(
  answerOption: string,
  factualAnswer: string
): boolean {
  answerOption = keyNormalizerForSlightlyFuzzyLookups(answerOption);
  factualAnswer = keyNormalizerForSlightlyFuzzyLookups(factualAnswer);
  if (answerOption === factualAnswer) {
    return true;
  }
}

/**
 * @hidden
 */
export function answerOptionMatchesFactualAnswerNumerically(
  answerOption: string,
  factualAnswer: string
): boolean {
  // Support matching eg "14" to "14 pounds"
  const numericalPartsOfAnswerOption = extractNumericalPartsOfAnswerOption(
    answerOption
  );
  const numericalPartsOfFactualAnswer = extractNumericalPartsOfAnswerOption(
    factualAnswer
  );
  if (
    numericalPartsOfAnswerOption.length > 0 &&
    numericalPartsOfFactualAnswer.length > 0
  ) {
    const factualAnswerNumeric = numericalPartsOfFactualAnswer[0];
    if (numericalPartsOfAnswerOption.length === 1) {
      const answerOptionNumeric = numericalPartsOfAnswerOption[0];
      return factualAnswerNumeric === answerOptionNumeric;
    }
    if (numericalPartsOfAnswerOption.length === 2) {
      if (
        numericalPartsOfAnswerOption[0] <= factualAnswerNumeric &&
        numericalPartsOfAnswerOption[1] >= factualAnswerNumeric
      ) {
        return true;
      }
    }
  }
  // Support matching eg "34%" to "30-40%"
  if (
    factualAnswer.indexOf("%") === factualAnswer.length - 1 &&
    answerOption.indexOf("%") === answerOption.length - 1 &&
    answerOption.indexOf("-") > -1
  ) {
    const factualAnswerPercentage = parseFloat(factualAnswer.replace("%", ""));
    const answerOptionPercentageRange = answerOption
      .replace("%", "")
      .split("-");
    if (
      parseFloat(answerOptionPercentageRange[0]) <= factualAnswerPercentage &&
      parseFloat(answerOptionPercentageRange[1]) >= factualAnswerPercentage
    ) {
      return true;
    }
  }
  return false;
}
