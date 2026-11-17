// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {readdirSync,writeFileSync,existsSync} from 'node:fs';
const images=[];
function walk(dir){if(!existsSync(dir))return;for(const entry of readdirSync(dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())walk(path);else if(/\/pagina-\d+\.webp$/.test(path))images.push(path.slice('public'.length));}}
walk('public/acervo');writeFileSync('src/data/reader-pages-manifest.json',JSON.stringify(images.sort())+'\n');console.log(`${images.length} páginas estáticas no manifesto do leitor.`);
