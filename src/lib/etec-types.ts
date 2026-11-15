export type EtecExam={id:string;title:string;institution:string;kind:string;source:string;examUrl:string;answerUrl:string;examSha256:string;answerSha256:string;pageCount:number;answerKeyRevised:boolean;questions:{number:number;page:number;pageMapped:boolean;answer:string;statement?:string;options?:{A:string;B:string;C:string;D:string;E?:string}}[];pages:{number:number;image:string;text:string}[]};
export type EtecSummary={id:string;title:string;count:number};
export type EtecReaderExam = Pick<EtecExam, "id" | "title" | "pageCount" | "answerKeyRevised" | "pages"> & {
  questions: (Omit<EtecExam["questions"][number], "answer"> & { annulled: boolean })[];
};
export type ReaderInstitution = "etec" | "coluni" | "ifsc" | "ifsp";

export function toReaderExam(exam: EtecExam): EtecReaderExam {
  return {
    id: exam.id,
    title: exam.title,
    pageCount: exam.pageCount,
    answerKeyRevised: exam.answerKeyRevised,
    pages: exam.pages,
    questions: exam.questions.map(({ answer, ...question }) => ({
      ...question,
      annulled: answer === "ANULADA",
    })),
  };
}
