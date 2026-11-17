// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {DefaultScheduler,Rating,type DefaultSchedulerCard} from 'ts-fsrs';
import type {ProgressEntry} from './study-progress';
export type RespostaAluno={questionId:string;banca:string;ano:number;disciplina:string;subtopico:string;habilidade:string;alternativaMarcada:string;correta:string;acertou:boolean;tempoMs:number;timestamp:number};
const scheduler=DefaultScheduler({version:'FSRS-7',enableFuzz:false});
export async function revisarComFsrs(previous:ProgressEntry|undefined,input:{questionId:string;selected:string;correctKey:string;attemptId:string;tempoMs?:number},now=Date.now()):Promise<ProgressEntry>{
 const engine=await scheduler,correct=input.selected===input.correctKey;
 // O schema da biblioteca valida o estado persistido; estados legados iniciam um cartão novo.
 let card:DefaultSchedulerCard;try{card=previous?.fsrs?{...previous.fsrs,dueAt:new Date(previous.fsrs.dueAt),lastReviewAt:previous.fsrs.lastReviewAt?new Date(previous.fsrs.lastReviewAt):null}:engine.newCard({now:new Date(now)});}catch{card=engine.newCard({now:new Date(now)});}
 const result=engine.review({card,grade:correct?Rating.Good:Rating.Again,now:new Date(now)}).card;
 const dueAt=new Date(result.dueAt).getTime();
 return {...input,correct,hadError:!correct||!!previous?.hadError,updatedAt:now,dueAt,intervalDays:(dueAt-now)/86400000,fsrs:JSON.parse(JSON.stringify(result)) as DefaultSchedulerCard};
}
export function resumirMetricas(items:RespostaAluno[]){
 const agrupar=(field:'disciplina'|'subtopico'|'banca')=>{const groups=new Map<string,{nome:string;total:number;acertos:number}>();for(const item of items){const nome=item[field]||'a-classificar',g=groups.get(nome)??{nome,total:0,acertos:0};g.total++;if(item.acertou)g.acertos++;groups.set(nome,g);}return [...groups.values()].map(g=>({...g,taxa:g.acertos/g.total,erros:g.total-g.acertos})).sort((a,b)=>b.erros-a.erros||a.nome.localeCompare(b.nome));};
 return {total:items.length,acertos:items.filter(i=>i.acertou).length,disciplinas:agrupar('disciplina'),assuntos:agrupar('subtopico'),bancas:agrupar('banca')};
}
