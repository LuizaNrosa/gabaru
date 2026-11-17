// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedLicense,auditLicenses,licenseSelection} from '../scripts/lib/licencas.mjs';

test('licenças: impede copyleft e expressões ambíguas em dependências diretas, dev e opcionais',()=>{
 for(const lock of [null,{}, {packages:[]},{packages:{}}])assert.throws(()=>auditLicenses(lock),/packages válida/);
 const report=auditLicenses({packages:{'':{license:'UNLICENSED'},'node_modules/a':{version:'1',license:'MIT'},'node_modules/b':{version:'1',license:'AGPL-3.0-only',dev:true},'node_modules/c':{version:'1',license:'LGPL-3.0-or-later',optional:true},'node_modules/d':{version:'1',license:'MIT AND GPL-3.0-only'},'node_modules/e':{version:'1'}}});
 assert.equal(report.checked,5);assert.equal(report.approved,1);assert.equal(report.violations.length,4);
 assert.ok(approvedLicense('(MPL-2.0 OR Apache-2.0)'));assert.equal(approvedLicense('MIT or unknown'),false);
});

test('licenças: OR seleciona licença permissiva e AND mantém todas as obrigações',()=>{
 assert.deepEqual(licenseSelection('(MIT OR GPL-3.0-or-later)'),['MIT']);
 assert.deepEqual(licenseSelection('(BSD-3-Clause AND Apache-2.0)'),['BSD-3-Clause','Apache-2.0']);
 assert.deepEqual(licenseSelection('(GPL-3.0-only AND MIT) OR Apache-2.0'),['Apache-2.0']);
 for(const value of ['MIT AND LGPL-3.0-only','MIT garbage','MIT WITH unknown','(MIT','MIT);eval(1)','MIT OR'])assert.equal(licenseSelection(value),null,value);
});

test('licenças: metadados ausentes não podem ser aprovados por um arquivo falsificado',()=>{
 const report=auditLicenses({packages:{'node_modules/limiter':{version:'1.1.5'}}},{readLicense:()=>Buffer.from('MIT')});
 assert.equal(report.violations.length,1);assert.equal(report.packages[0].resolved,null);
});

test('licenças: reconhece o texto MIT distribuído pelo limiter, conferido por hash',()=>{
 const report=auditLicenses({packages:{'node_modules/limiter':{version:'1.1.5'}}});
 assert.equal(report.violations.length,0);assert.equal(report.packages[0].resolved,'MIT');assert.ok(report.packages[0].sha256);
});

test('licenças: exceção LGPL só vale para o mesmo artefato Sharp herdado',async()=>{
 const {readFileSync}=await import('node:fs');const [entry]=JSON.parse(readFileSync(new URL('../scripts/lib/licencas-herdadas-v3.json',import.meta.url),'utf8'));
 const make=(overrides={})=>({packages:{[entry.path]:{version:entry.version,license:entry.license,integrity:entry.integrity,...overrides}}});
 assert.equal(auditLicenses(make()).violations.length,0);
 for(const change of [{version:'999.0.0'},{integrity:'sha512-diferente'},{license:'GPL-3.0-only'}])assert.equal(auditLicenses(make(change)).violations.length,1);
 assert.equal(approvedLicense('LGPL-3.0-or-later'),false);assert.equal(approvedLicense('SSPL-1.0'),false);
});
