/**
 * @hidden
 */
export function answerOptionMatchesFactualAnswer(
  answerOption: string,
  factualAnswer: string
): boolean {
  answerOption = answerOption.trim();
  factualAnswer = factualAnswer.trim();
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
  return answerOption === factualAnswer;
}
