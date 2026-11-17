import fs from 'node:fs';
const m=JSON.parse(fs.readFileSync('src/data/seo-publico.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('src/data/catalogo-v2.json','utf8'));
const questions=new Map(catalog.questoes.map(q=>['/questoes/'+q.slug,q]));
const intro=`# Gabaru\n\nPreparação para ENEM, vestibulinhos e vestibulares. Origem canônica: ${m.origin}. Autoria e curadoria: Luiza Nascimento Rosa.\n\n`;
const links=entries=>entries.map(e=>`- ${m.origin}${e.loc}`).join('\n');
fs.writeFileSync('public/llms.txt',intro+'## Catálogo público\n'+links([...m.families.hubs,...m.families.livros])+'\n\nCatálogo detalhado: '+m.origin+'/llms-full.txt\nSitemap: '+m.origin+'/sitemap.xml\n');
let full=intro+'Somente URLs do mesmo catálogo público dos sitemaps. Questões Tier 0 são excluídas; Tier 1 tem texto/alternativas/gabarito oficial conferidos e Tier 2 acrescenta resolução. Não são atribuídos gabaritos ou habilidades ausentes.\n\nLivros são lidos internamente, com autenticação; capítulos em preparação não são anunciados como concluídos. Não há download PDF/EPUB autoral.\n\n## Livros\n'+m.books.map(b=>`- ${b.titulo}: ${b.capitulos.length} capítulos no sumário.`).join('\n')+'\n';
for(const [kind,entries] of Object.entries(m.families)){full+='\n## '+kind+'\n';for(const e of entries){const q=questions.get(e.loc);full+=`- ${m.origin}${e.loc}${q?`; ${q.banca.toUpperCase()} ${q.ano}, questão ${q.numero}; ${q.disciplina}; ${q.assunto}; ${q.nivelQualidade}`:''}; atualização ${e.lastmod}.\n`;}}
fs.writeFileSync('public/llms-full.txt',full);console.log('llms.txt e llms-full.txt sincronizados com seo-publico.json.');
