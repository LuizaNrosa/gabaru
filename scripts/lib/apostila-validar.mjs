// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {createHash} from 'node:crypto';
/** Regras do HTML de capítulo publicado no leitor (o site o insere sem sanitizar, então só aceita HTML estático nosso). */
export function validarCapitulo(html,{sha256,questoesEtec=0,modo='link'}={}){
 const erros=[];
 if(/<script|<iframe|<object|<embed|<img|<link|<style|<form|<input|\son[a-z]+\s*=|javascript:|FIGTOKEN|INSERIR FIGURA/i.test(html))erros.push('conteúdo ativo ou marcador pendente');
 for(const [,href] of html.matchAll(/href="([^"]+)"/g))if(!/^https:\/\//.test(href))erros.push('link não https: '+href);
 if((html.match(/<details/g)??[]).length!==(html.match(/<\/details>/g)??[]).length)erros.push('details desbalanceado');
 for(const id of ['titulo-capitulo','abertura','teoria','exemplos','exercicios','gabarito','fechamento'])if(!html.includes(`id="${id}"`))erros.push('âncora ausente: '+id);
 if(modo==='link'){if(html.includes('texto do caderno oficial'))erros.push('enunciado oficial da ETEC presente');if((html.match(/Abra o caderno oficial no link abaixo/g)??[]).length<questoesEtec)erros.push('questão ETEC sem link oficial');}
 if(sha256&&createHash('sha256').update(html).digest('hex')!==sha256)erros.push('sha256 diferente do indice.json');
 return erros;
}
