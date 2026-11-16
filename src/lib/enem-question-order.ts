export type EnemLanguage = "ingles" | "espanhol";

type EnemQuestion = { numero: number; disciplina: string; idiomaTexto?: string };

function spanishAlternate(question: EnemQuestion) {
  return question.idiomaTexto === "es" || question.disciplina === "espanhol" && ((question.numero >= 101 && question.numero <= 105) || (question.numero >= 91 && question.numero <= 95));
}

export function hasEnemLanguages(questions: readonly EnemQuestion[]) {
  return questions.some(spanishAlternate);
}

export function enemDisplayNumber(question: EnemQuestion) {
  return spanishAlternate(question) && question.numero >= 101 && question.numero <= 105 ? question.numero - 100 : question.numero;
}

export function selectEnemQuestions<T extends EnemQuestion>(questions: readonly T[], language: EnemLanguage): T[] {
  const bilingual = hasEnemLanguages(questions);
  return questions.filter(question => {
    if (!bilingual) return true;
    return language === "ingles"
      ? !spanishAlternate(question)
      : !(question.disciplina === "ingles" && ((question.numero >= 1 && question.numero <= 5) || (question.numero >= 91 && question.numero <= 95)));
  }).sort((a, b) => enemDisplayNumber(a) - enemDisplayNumber(b));
}
