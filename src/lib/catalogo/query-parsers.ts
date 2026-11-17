import {createParser} from 'nuqs/server';
import banks from '../../data/bancas-publicas.json' with {type:'json'};
const stringParser=(accept:(value:string)=>boolean)=>createParser({parse:(value:string)=>accept(value)?value:null,serialize:(value:string)=>value}).withDefault('');
export const textParser=createParser({parse:(v:string)=>v.length<=160?v.trim().replace(/\s+/g,' '):null,serialize:(v:string)=>v}).withDefault('');
const slugParser=stringParser(v=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)&&v.length<=80);
const choice=(values:string[])=>stringParser(v=>values.includes(v));
export const questionParsers={
 status:choice(['nao-resolvidas','erradas','comentadas','video']),habilidade:stringParser(v=>/^[\p{L}\p{N}_.-]{1,80}$/u.test(v)),
 categoria:choice(['enem','vestibulinho','vestibulares']),comentadas:choice(['1']),erros:choice(['1']),
 banca:choice(banks),ano:stringParser(v=>/^(19|20)\d{2}$/.test(v)&&Number(v)<=new Date().getFullYear()+1),disciplina:slugParser,assunto:slugParser,busca:textParser,
 pagina:createParser({parse:(v:string)=>/^[1-9]\d{0,4}$/.test(v)?v:null,serialize:(v:string)=>v}).withDefault('1')
};
export const examParsers={q:textParser,banca:choice(banks)};
