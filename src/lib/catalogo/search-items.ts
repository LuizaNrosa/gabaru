import 'server-only';
import {catalogo,nomeTaxonomia} from './index';
import type {SearchItem} from './search';

/** Itens da busca de /questoes. Ficam fora do HTML: o navegador baixa sob demanda em /questoes/indice-busca. */
export const searchItems:SearchItem[]=catalogo.questoes.filter(q=>q.nivelQualidade!=='nivel-0-quarentena'&&q.enunciado.trim()&&q.alternativas.length>=4).map(({id,slug,banca,ano,disciplina,assunto,tema,enunciado,habilidade,youtubeVideoId,categoria,nivelQualidade,correta,statusPublicacao})=>({id,slug,banca,ano,disciplina,assunto,tema,enunciado:enunciado.slice(0,400),habilidade,youtubeVideoId,categoria,nivelQualidade,correta,statusPublicacao}));

export const searchLabels:Record<string,string>={enem:'ENEM',vestibulinho:'Vestibulinho',vestibulares:'Vestibulares',...Object.fromEntries([...searchItems.flatMap(q=>[q.disciplina,q.assunto]).map(s=>[s,nomeTaxonomia(s)]),...catalogo.bancas.map(b=>[b.slug,b.sigla])])};

const distinct=(values:(string|number|undefined)[])=>[...new Set(values.map(v=>v===undefined?'':String(v)))].filter(v=>v&&v!=='undefined');
/** Opções dos filtros, calculadas uma vez no servidor para não depender do índice completo no cliente. */
export const searchOptions={
  habilidade:distinct(searchItems.map(q=>q.habilidade)).sort((a,b)=>a.localeCompare(b,'pt-BR')),
  ano:distinct(searchItems.map(q=>q.ano)).sort((a,b)=>Number(b)-Number(a)),
  disciplina:distinct(searchItems.map(q=>q.disciplina)).sort((a,b)=>a.localeCompare(b,'pt-BR')),
  assunto:Object.fromEntries([['',distinct(searchItems.map(q=>q.assunto)).sort((a,b)=>a.localeCompare(b,'pt-BR'))],...distinct(searchItems.map(q=>q.disciplina)).map(d=>[d,distinct(searchItems.filter(q=>q.disciplina===d).map(q=>q.assunto)).sort((a,b)=>a.localeCompare(b,'pt-BR'))])]) as Record<string,string[]>,
};
export type SearchOptions=typeof searchOptions;
