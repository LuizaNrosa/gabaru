import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const raw=readFileSync(new URL('../src/data/etec-2026-2.ts',import.meta.url),'utf8');const exam=JSON.parse(raw.replace(/^export const ETEC_2026_2 = /,'').replace(/ as const;\s*$/,''));
test('gabarito contém exatamente 50 alternativas válidas',()=>{assert.equal(exam.answerKey.length,50);assert.match(exam.answerKey,/^[ABCDE]{50}$/)});
test('sequência coincide com transcrição independente do PDF oficial',()=>{assert.equal(exam.answerKey,"CBEDDBDADBBAAEBABBDECCEEBCDADBECACDAEECEBCDACEADEB")});
test('fontes correspondem à mesma edição e hashes estão registrados',()=>{assert(exam.examUrl.includes('20262210689'));assert(exam.answerUrl.includes('20262210689'));assert.match(exam.examSha256,/^[a-f0-9]{64}$/);assert.match(exam.answerSha256,/^[a-f0-9]{64}$/);assert.equal(exam.rights.mode,'link-only')});
