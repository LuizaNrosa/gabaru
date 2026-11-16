import type {Questao} from './types';
export function incidence(questions:Questao[]){
 const eligible=questions.filter(q=>q.nivelQualidade!=='nivel-0-quarentena');const unique=new Map<string,Questao>();
 for(const q of eligible){const key=[q.banca,q.ano,q.enunciado.replace(/\s+/g,' ').trim(),q.alternativas.map(a=>a.texto).join('|')].join(':');if(!unique.has(key))unique.set(key,q);}
 const classified=[...unique.values()].filter(q=>q.assunto&&q.assunto!=='a-classificar'&&q.disciplina!=='a-classificar');const groups=new Map<string,{assunto:string;disciplina:string;count:number}>();
 for(const q of classified){const key=q.disciplina+':'+q.assunto;const current=groups.get(key)??{assunto:q.assunto,disciplina:q.disciplina,count:0};current.count++;groups.set(key,current);}
 return {total:questions.length,eligible:eligible.length,unique:unique.size,classified:classified.length,rows:[...groups.values()].sort((a,b)=>b.count-a.count||a.assunto.localeCompare(b.assunto)).slice(0,10)};
}
