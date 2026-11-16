import {severeNoise} from './saneamento.mjs';
import {createHash} from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve,sep } from 'node:path';
export const N0='nivel-0-quarentena',N1='nivel-1-gabarito-oficial',N2='nivel-2-resolucao-comentada';
export function resolutionValid(r,q){if(!r||r.alternativaCorreta!==q.correta||typeof r.conceito!=='string'||r.conceito.trim().length<20||!Array.isArray(r.passos)||r.passos.length<2||r.passos.some(s=>typeof s!=='string'||s.trim().length<15))return false;return q.alternativas.filter(a=>a.letra!==q.correta).every(a=>typeof r.distratores?.[a.letra]==='string'&&r.distratores[a.letra].trim().length>=15)&&Object.keys(r.distratores??{}).length===q.alternativas.length-1;}
export function questionQuality(q,{gabaritoVerificado=false,expected=5,legadaComentada=false,textoConferido=false}={}){
 const motivos=[];
 if(q.banca==='enem'&&!textoConferido&&!q.proveniencia?.extracaoValidada)motivos.push('transcricao-ocr-sem-conferencia-de-layout');
 if(severeNoise([q.enunciado,q.textoBase?.texto,...q.alternativas.map(a=>a.texto),...(q.comentarioResolucao??[])].join(' ')))motivos.push('ruido-severo-de-ocr');
 if(q.enunciado.trim().length<20&&!q.textoBase?.texto)motivos.push('enunciado-ausente-ou-insuficiente');
 if(q.alternativas.length!==expected||q.alternativas.map(a=>a.letra).join('')!=='ABCDE'.slice(0,expected)||q.alternativas.some(a=>!/[\p{L}\p{N}]/u.test(a.texto)))motivos.push('alternativas-incompletas');
 if(q.anulada)motivos.push('questao-anulada-retida-para-revisao-editorial');
 if(!q.correta||!q.alternativas.some(a=>a.letra===q.correta))motivos.push('gabarito-ausente-ou-invalido');
 if(!gabaritoVerificado)motivos.push('gabarito-sem-conferencia-documentada');
 if(/\ufffd/.test(q.enunciado)||q.alternativas.some(a=>/^\d+\s*\n\s*\d/.test(a.texto)||/\b10\s+\d+\s*[.]?$/.test(a.texto)))motivos.push('texto-ou-formula-requer-revisao');
 if(/\b(?:figuras?|gráficos?|tabelas?|charges?|imagens?|esquemas?|tirinhas?)\b/i.test(q.enunciado)&&!q.imagens.length&&!q.tabelas?.length)motivos.push('recurso-visual-ausente');
 const base=resolve('public')+sep;
 if(q.imagens.some(a=>!a.src.startsWith('/')||!resolve('public','.'+a.src).startsWith(base)||!existsSync(resolve('public','.'+a.src))||a.alt.trim().length<30||!a.caption.trim()))motivos.push('imagem-sem-asset-ou-descricao-valida');
 if(q.proveniencia&&!q.proveniencia.extracaoValidada)motivos.push('extracao-em-quarentena');
 return {nivelQualidade:motivos.length?N0:resolutionValid(q.resolucaoEstruturada,q)||legadaComentada?N2:N1,motivos};
}
export function examQuality(e,byId){const reasons=[];const qs=e.questoes.map(id=>byId.get(id));if(!e.total||!e.questoes.length)reasons.push('caderno-apenas-documental-sem-itens');if(qs.length!==e.total)reasons.push('quantidade-de-questoes-divergente');if(new Set(e.questoes).size!==e.questoes.length)reasons.push('questoes-duplicadas');if(qs.some(q=>!q||q.nivelQualidade===N0))reasons.push('questoes-incompletas-ou-em-quarentena');return {nivelQualidade:reasons.length?N0:qs.every(q=>q.nivelQualidade===N2)?N2:N1,motivos:reasons};}

export function contentFingerprint(q){return createHash('sha256').update(JSON.stringify([q.enunciado.replace(/\n+/g,' '),q.textoBase,q.alternativas,q.correta])).digest('hex');}
