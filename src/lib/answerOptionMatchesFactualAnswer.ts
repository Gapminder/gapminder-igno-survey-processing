/**
 * @hidden
 */
export function answerOptionMatchesFactualAnswer(
  answerOption: string,
  factualAnswer: string
): boolean {
  return answerOption.trim() === factualAnswer.trim();
}
