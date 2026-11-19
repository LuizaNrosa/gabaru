import colecao from '@/data/colecao-vestibulinho.json';
import {projectEditorialText} from './editorial-segments';
import fs from 'node:fs';import path from 'node:path';import type {MathSegment} from './catalogo/types';import {z} from 'zod';
// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import 'server-only';
import { apostilaEtecSlug, capitulosPortugues, type CapituloPortugues } from './apostila-etec-portugues';
export type ReferenciaBibliografica={arquivo:string;sha256:string;titulo:string;autores:string[];url:string;licenca:string;evidenciaLicenca:string;usoComercialAutorizado:boolean;paginas:number[]};
export type Capitulo={portugues?:CapituloPortugues;apendicePortugues?:boolean;exemplos?:{enunciado:string;passos:string[];resposta:string}[];bibliografia?:ReferenciaBibliografica[];licencaConteudo?:string;referenciasCurriculares?:{fonte:string;pagina:number;codigosExtraidos:string[];observacao:string}[];introducao:string;secoes:{titulo:string;texto:string;segmentos?:MathSegment[]}[];disciplina:string;amostra?:boolean;questoes?:string[];fonte?:{arquivo:string;sha256:string;paginas:number};grafico?:{funcao:string;pontos:[number,number][]};molecula?:{smiles:string;descricao:string}};
const capitulos:Record<string,Capitulo>={
 'vestibulinho-etec/razao-e-proporcao':{introducao:'Comparar grandezas exige escolher a ordem da divisão e manter as unidades consistentes. Uma razão expressa quanto uma quantidade representa em relação à outra.',disciplina:'matematica',secoes:[{titulo:'Organize antes de calcular',texto:'Se uma receita usa 2 xícaras de arroz para 3 de água, a razão arroz/água é $2/3$. Para dobrar a receita, multiplique ambas as quantidades pelo mesmo fator: 4 e 6. O quociente permanece igual.'},{titulo:'Proporcionalidade direta',texto:'Quando o preço por quilograma é constante, o custo total satisfaz $C(x)=p x$. Se 3 kg custam R$ 24, o preço unitário é $24/3=8$ reais por quilograma. Assim, 5 kg custam R$ 40. Confira as unidades antes de multiplicar.'},{titulo:'Evite a regra de três automática',texto:'Nem toda relação é diretamente proporcional. Uma tarifa fixa mais um valor por quilômetro é $C(x)=b+p x$. Dobrar a distância não dobra o custo total quando $b$ é diferente de zero. Identifique a parcela fixa no enunciado.'}]},
 'vestibulinho-etec/unidades-e-escalas':{introducao:'Uma medida combina um número e uma unidade. A conversão deve preservar a quantidade representada, alterando apenas a forma de escrevê-la.',disciplina:'matematica',secoes:[{titulo:'Conversões lineares e áreas',texto:'Como $1\\,\\mathrm{m}=100\\,\\mathrm{cm}$, um quadrado de lado 1 m tem área $100\\times100=10\\,000\\,\\mathrm{cm}^2$. O fator de conversão das áreas é o quadrado do fator linear.'},{titulo:'Escala cartográfica',texto:'Uma escala 1:50 000 significa que 1 cm no mapa corresponde a 50 000 cm no terreno, isto é, 500 m. Um segmento de 4 cm representa 2 km. Use a mesma unidade em numerador e denominador.'},{titulo:'Verificação dimensional',texto:'A velocidade média é $v=\\Delta s/\\Delta t$. Dividir quilômetros por horas produz km/h. Para converter 72 km/h em m/s, divida por 3,6: o resultado é 20 m/s.'}]},
 'enem-exatas-e-linguagens/funcoes-e-modelagem':{introducao:'Uma função associa a cada entrada de seu domínio uma única saída. Modelar um problema é escolher quais grandezas variam e explicitar as hipóteses da relação.',disciplina:'matematica',grafico:{funcao:'2*x+1',pontos:[[0,1],[1,3],[2,5],[3,7]]},secoes:[{titulo:'Taxa de variação',texto:'Na função $f(x)=2x+1$, cada aumento de uma unidade em $x$ acrescenta duas unidades em $f(x)$. O coeficiente 2 é a taxa de variação; o valor inicial é $f(0)=1$.'},{titulo:'Interprete o domínio',texto:'Se $x$ conta ingressos, o domínio pode conter apenas inteiros não negativos. Um gráfico contínuo é uma representação auxiliar; ele não autoriza vender meio ingresso. Volte sempre ao contexto.'},{titulo:'Leia a interseção',texto:'Para encontrar quando $2x+1=7$, subtraia 1 dos dois lados e divida por 2. Assim, $x=3$. Substituir o resultado na função original verifica a solução.'}]},
 'enem-exatas-e-linguagens/moleculas-e-leitura-cientifica':{introducao:'Textos científicos conectam observações, modelos e evidências. Na química orgânica, a estrutura ajuda a reconhecer grupos funcionais e discutir propriedades sem decorar apenas nomes.',disciplina:'quimica',molecula:{smiles:'CCO',descricao:'Etanol: dois átomos de carbono ligados em cadeia e uma hidroxila terminal. Fórmula molecular C₂H₆O.'},secoes:[{titulo:'Estrutura e fórmula',texto:'O etanol tem fórmula $\\mathrm{C}_2\\mathrm{H}_6\\mathrm{O}$. Sua hidroxila caracteriza a função álcool. A fórmula molecular informa as quantidades de átomos, mas não identifica sozinha todas as possibilidades de conectividade.'},{titulo:'Conecte propriedade e evidência',texto:'A hidroxila permite interações por ligação de hidrogênio. Para comparar temperaturas de ebulição, considere também tamanho molecular e outras interações; um único grupo funcional não decide toda comparação.'},{titulo:'Interpretação crítica',texto:'Separe os resultados medidos das hipóteses propostas pelo autor. Uma correlação apresentada em um gráfico, isoladamente, não demonstra causa. Procure controles experimentais, condições de medida e limites da conclusão.'}]}
};
let exerciseIds:Set<string>|undefined;
function verifiedExerciseIds(){if(!exerciseIds){const catalog=JSON.parse(fs.readFileSync(path.join(process.cwd(),'src/data/catalogo-v2.json'),'utf8')) as {questoes:{id:string;tier:string;anulada:boolean;banca:string}[]};exerciseIds=new Set(catalog.questoes.filter(q=>q.tier!=='tier-0-quarentena'&&!q.anulada&&['etec','ifsp','ifsc','ifrs','ifrn','ifmg','ifba','ifce','ifmt','ifam','ifes','ifpr'].includes(q.banca)).map(q=>q.id));}return exerciseIds;}
const exemploSchema=z.object({enunciado:z.string().min(1),passos:z.array(z.string().min(1)).min(3),resposta:z.string().min(1)});
const referenciaSchema=z.object({arquivo:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/),titulo:z.string().min(1),autores:z.array(z.string()).min(1),url:z.url().refine(v=>['https:','http:'].includes(new URL(v).protocol)),licenca:z.enum(['CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0','Public-Domain','Ato-Normativo','Autorizacao-Expressa']),evidenciaLicenca:z.string().min(3),usoComercialAutorizado:z.literal(true),paginas:z.array(z.number().int().positive()).min(1)});
export function obterCapitulo(livro:string,capitulo:string):Capitulo|undefined{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(livro)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(capitulo))return undefined;
 if (livro === apostilaEtecSlug && capitulo === 'apendice') {
  return { introducao: 'Edital verticalizado e incidência histórica de Português e Interpretação de Texto.',
   disciplina: 'portugues', secoes: [], questoes: [], apendicePortugues: true };
 }
 const portugues = livro === apostilaEtecSlug && Object.hasOwn(capitulosPortugues, capitulo)
  ? capitulosPortugues[capitulo]
  : undefined;
 if (portugues) {
  return {
   introducao: portugues.introducao,
   disciplina: 'portugues',
   secoes: portugues.teoria,
   questoes: portugues.oficiais.map(questao => questao.id),
   portugues,
  };
 }
 const sample=capitulos[`${livro}/${capitulo}`];
 const fallback=()=>sample?{...sample,amostra:true}:undefined;
 const file=path.join(process.cwd(),'content/livros',livro,capitulo+'.json');
 if(!fs.existsSync(file))return fallback();
 const raw=JSON.parse(fs.readFileSync(file,'utf8'));
 if(raw.status==='rascunho')return fallback();
 const isCollection=colecao.some(l=>l.slug===livro);
 const schema=z.object({status:z.literal('publicado'),introducao:z.string().min(1),disciplina:z.string(),secoes:z.array(z.object({titulo:z.string(),texto:z.string()})).min(1),questoes:z.array(z.string()).length(isCollection?6:5).refine(ids=>new Set(ids).size===ids.length),fonte:z.object({arquivo:z.string(),sha256:z.string(),paginas:z.number()}).optional(),exemplos:z.array(exemploSchema).optional(),bibliografia:z.array(referenciaSchema).min(1).optional(),licencaConteudo:z.string().optional(),referenciasCurriculares:z.array(z.object({fonte:z.string(),pagina:z.number(),codigosExtraidos:z.array(z.string()),observacao:z.string()})).optional(),revisaoEditorial:z.object({responsavel:z.string().min(3),data:z.iso.date()}).optional(),grafico:z.object({funcao:z.string(),pontos:z.array(z.tuple([z.number(),z.number()])).min(2)}).optional()});
 const parsed=schema.parse(raw);
 if(isCollection){
  if(!parsed.bibliografia||!parsed.exemplos?.length||!parsed.revisaoEditorial)throw Error('Publicação da coleção requer bibliografia, exemplos e revisão editorial identificada.');
  if(parsed.bibliografia.some(r=>r.licenca==='CC-BY-SA-4.0')&&parsed.licencaConteudo!=='CC-BY-SA-4.0')throw Error('A adaptação deve preservar CC-BY-SA-4.0.');
  for(const id of parsed.questoes)if(!verifiedExerciseIds().has(id))throw Error('Exercício da coleção não é ETEC/IFs validado: '+id);
 }
 for(const ex of parsed.exemplos??[]){projectEditorialText(ex.enunciado);for(const step of ex.passos)projectEditorialText(step);projectEditorialText(ex.resposta);}
 return {...parsed,secoes:parsed.secoes.map(s=>({...s,segmentos:projectEditorialText(s.texto)}))};
}
