// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DefaultScheduler,Rating} from 'ts-fsrs';
import SmilesDrawer from 'smiles-drawer';

test('FSRS-7 mantém estado de memória rápida e produz revisão futura sem fuzz',async()=>{
 const scheduler=await DefaultScheduler({version:'FSRS-7',enableFuzz:false});
 const now=new Date('2026-11-16T00:00:00Z');
 const {card}=scheduler.review({card:scheduler.newCard({now}),grade:Rating.Good,now});
 assert.ok(Number.isFinite(card.stabilityFast)&&card.stabilityFast>0);
 assert.ok(Number.isFinite(card.stability)&&card.stability>0);
 assert.ok(new Date(card.dueAt).getTime()>now.getTime());assert.equal(card.reps,1);
});

test('parser SMILES distingue os três átomos do etanol e rejeita sintaxe incompleta',async()=>{
 const parse=text=>new Promise((resolve,reject)=>SmilesDrawer.parse(text,resolve,reject));
 const tree=await parse('CCO');assert.deepEqual([tree.atom,tree.next.atom,tree.next.next.atom],['C','C','O']);assert.equal(tree.next.next.next,null);
 await assert.rejects(parse('C('));
});
