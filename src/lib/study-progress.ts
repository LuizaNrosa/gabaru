import type {DefaultSchedulerCard} from 'ts-fsrs';
export type ProgressEntry={fsrs?:DefaultSchedulerCard;tempoMs?:number;questionId:string;selected:string;correctKey:string;correct:boolean;hadError:boolean;attemptId:string;updatedAt:number;dueAt:number;intervalDays:number};
export function nextReview(previous:ProgressEntry|undefined,input:{questionId:string;selected:string;correctKey:string;attemptId:string},now=Date.now()):ProgressEntry{
 const correct=input.selected===input.correctKey;const intervalDays=correct?Math.min(30,Math.max(1,(previous?.intervalDays??0)*2)):1;
 return {...input,correct,hadError:!correct||!!previous?.hadError,updatedAt:now,intervalDays,dueAt:now+intervalDays*86400000};
}
export function progressKeys(uid?:string){return {progress:uid?`gabaru:v2:progresso:${uid}`:'gabaru:v2:progresso',errors:uid?`gabaru:v2:erros:${uid}`:'gabaru:v2:erros',pending:`gabaru:v2:pendentes:${uid??'visitante'}`};}
