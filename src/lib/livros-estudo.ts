import 'server-only';
import geoData from '@/data/livros-geo.json';
import {obterCapitulo} from './livros-conteudo';
import {questoesIndexaveis,nomeTaxonomia} from './catalogo';
import type {Livro} from './livros';
export type SecaoGeo={assunto?:string;definicao:string;exemplo:{enunciado:string;passos:string[];resposta:string};pegadinha:string};
const geo=new Map<string,SecaoGeo[]>(Object.entries(geoData));
export function secoesGeo(livro:string,capitulo:string){return geo.get(`${livro}/${capitulo}`)??[];}
export function exerciciosCapitulo(livro:string,capitulo:string){const c=obterCapitulo(livro,capitulo);if(!c)return [];const eligible=questoesIndexaveis.filter(q=>q.tier!=='tier-0-quarentena');return c.questoes?c.questoes.flatMap(id=>{const q=eligible.find(q=>q.id===id);return q?[q]:[];}):eligible.filter(q=>q.disciplina===c.disciplina).slice(0,5);}
export function leituraCapitulo(livro:string,capitulo:string){const c=obterCapitulo(livro,capitulo);if(!c)return null;
 if(c.apendicePortugues)return 4;
 if(c.portugues){
  const p=c.portugues;
  const texto=[p.introducao,p.raioX,...p.intuicao,...p.teoria.map(t=>t.texto),p.armadilha,
   ...p.exemplos.flatMap(e=>[...e.suporte,e.comando,...e.alternativas,...e.passos]),
   ...p.oficiais.flatMap(q=>[q.justificativa,...q.distratores]),...p.resumo].join(' ');
  return Math.max(1,Math.ceil(texto.trim().split(/\s+/).length/180));
 }
 const text=[c.introducao,...c.secoes.map(s=>s.texto),...secoesGeo(livro,capitulo).flatMap(s=>[s.definicao,s.exemplo.enunciado,...s.exemplo.passos,s.exemplo.resposta,s.pegadinha]),...(c.exemplos??[]).flatMap(e=>[e.enunciado,...e.passos,e.resposta])].join(' ');return Math.max(1,Math.ceil(text.trim().split(/\s+/).length/180));}
export function dadosLivro(livro:Livro){const chapters=livro.capitulos.map(c=>({...c,minutos:leituraCapitulo(livro.slug,c.slug),questoes:exerciciosCapitulo(livro.slug,c.slug).length}));const ids=new Set(livro.capitulos.flatMap(c=>exerciciosCapitulo(livro.slug,c.slug).map(q=>q.id)));return {chapters,questoes:ids.size,minutos:chapters.reduce((n,c)=>n+(c.minutos??0),0),amostra:chapters.find(c=>c.status==='amostra'),capa:`/capas/livro-${livro.slug}.svg`,social:`/capas/social-livro-${livro.slug}.svg`,miniatura:`/capas/mini-livro-${livro.slug}.svg`};}
export function praticaTopico(disciplina:string,assunto?:string){const all=questoesIndexaveis.filter(q=>q.tier!=='tier-0-quarentena'&&q.disciplina===disciplina);const matching=assunto?all.filter(q=>q.assunto===assunto):[];const chosen=matching.length?matching:all;const params=new URLSearchParams({disciplina,...(matching.length?{assunto}: {})});return {href:'/questoes?'+params.toString(),count:chosen.length,label:matching.length&&assunto?nomeTaxonomia(assunto):nomeTaxonomia(disciplina)};}
export const livroFaq=[{question:'Como acessar os capítulos disponíveis?',answer:'Crie uma conta gratuita e entre para ler as amostras disponíveis. Capítulos em preparação são identificados no sumário e não são apresentados como conteúdo concluído.'},{question:'Posso baixar o livro em PDF ou EPUB?',answer:'Os livros autorais são lidos dentro do Gabaru, por capítulo, com exercícios e acompanhamento do estudo. Não há download de PDF ou EPUB desses livros.'}];
