// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
// Envia o corpo dos 13 capítulos da Apostila de Matemática ETEC para o Firestore (coleção fechada
// apostilas_conteudo; só o servidor lê, depois de conferir a compra). O repositório é público, então
// o HTML pago nunca entra no Git.
//
// Uso: node --env-file=.env.local scripts/publicar-apostila-matematica.mjs <pasta-saida> [--enviar]
//   <pasta-saida> = matematica-final/site/saida (gerada por exportar_site.py --etec=link)
//   sem --enviar só valida. Exige FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.
import {readFileSync} from 'node:fs';import {join} from 'node:path';
import {validarCapitulo} from './lib/apostila-validar.mjs';
const [pasta]=process.argv.slice(2).filter(a=>!a.startsWith('--')),enviar=process.argv.includes('--enviar');
if(!pasta)throw Error('Informe a pasta saida/ gerada por exportar_site.py');
const indice=JSON.parse(readFileSync('content/apostilas/matematica-etec/indice.json','utf8'));
const local=JSON.parse(readFileSync(join(pasta,'indice.json'),'utf8'));
if(JSON.stringify(local)!==JSON.stringify(indice))throw Error('indice.json da pasta difere do repositório: copie o novo indice.json para content/apostilas/matematica-etec/ e faça o deploy junto.');
const docs=indice.capitulos.map(c=>{const html=readFileSync(join(pasta,c.arquivo),'utf8');const erros=validarCapitulo(html,{sha256:c.sha256,questoesEtec:c.questoesEtec,modo:indice.modoQuestoesEtec});if(erros.length)throw Error(`${c.arquivo}: ${erros.join('; ')}`);return {id:`matematica-etec__${String(c.numero).padStart(2,'0')}`,html,sha256:c.sha256};});
console.log(`${docs.length} capítulos válidos (${Math.round(docs.reduce((n,d)=>n+d.html.length,0)/1024)} KB).`);
if(!enviar){console.log('Validação apenas. Rode com --enviar para gravar no Firestore.');process.exit(0);}
const {cert,initializeApp}=await import('firebase-admin/app');const {getFirestore}=await import('firebase-admin/firestore');
const {FIREBASE_ADMIN_PROJECT_ID:projectId,FIREBASE_ADMIN_CLIENT_EMAIL:clientEmail,FIREBASE_ADMIN_PRIVATE_KEY:key}=process.env;
if(!projectId||!clientEmail||!key)throw Error('Variáveis FIREBASE_ADMIN_* não configuradas.');
const db=getFirestore(initializeApp({credential:cert({projectId,clientEmail,privateKey:key.replace(/\\n/g,'\n')})}));
const batch=db.batch();for(const d of docs)batch.set(db.collection('apostilas_conteudo').doc(d.id),{html:d.html,sha256:d.sha256,atualizadoEm:Date.now()});
await batch.commit();console.log(`Enviado para o projeto ${projectId}: ${docs.map(d=>d.id).join(', ')}`);
