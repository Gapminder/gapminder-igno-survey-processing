/**
 * Returns the parts of the answer option that are numerical in nature
 * (integers, floats, percentages or ranges of such)
 * @hidden
 */
export function extractNumericalPartsOfAnswerOption(
  answerOption: string
): number[] {
  answerOption = String(answerOption)
    .trim()
    .toLocaleLowerCase();

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  if (isNumeric(answerOption)) {
    return [parseFloat(answerOption)];
  }

  // If has a "-" sign somewhere not in the beginning, it may be a range and we try both sides of the range
  if (answerOption.indexOf("-") > 0) {
    const range = answerOption.split("-");
    if (range.length > 2) {
      return [];
    }
    if (
      extractNumericalPartsOfAnswerOption(range[0]).length > 0 &&
      extractNumericalPartsOfAnswerOption(range[1]).length > 0
    ) {
      return extractNumericalPartsOfAnswerOption(range[0]).concat(
        extractNumericalPartsOfAnswerOption(range[1])
      );
    }
  }

  // If ends with non-numeric characters, check if the beginning is numerical ("1%", "1000€", "14 pounds" etc)
  const nonNumericRegex = /[^\d.-]+$/;
  if (nonNumericRegex.test(answerOption)) {
    const answerOptionWithoutNonNumericalEnding = answerOption.replace(
      nonNumericRegex,
      ""
    );
    return isNumeric(answerOptionWithoutNonNumericalEnding)
      ? [Number(answerOptionWithoutNonNumericalEnding)]
      : [];
  }

  return [];
}
