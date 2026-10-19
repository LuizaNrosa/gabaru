import Link from "next/link";
const paths = [
  { n: "01", name: "Vestibulinhos", exams: "ETEC · IFs · Colégio Embraer · Coluni", text: "Uma nova etapa começa com uma boa base.", href: "/pre-vestibulinho", tag: "Foco do projeto" },
  { n: "02", name: "ENEM e vestibulares", exams: "ENEM · Fuvest · Unicamp · Unesp", text: "Pratique com questões oficiais do ENEM.", href: "/treino", tag: "Treino ENEM disponível" },
  { n: "03", name: "Concursos", exams: "Matemática · Raciocínio lógico", text: "Preparação para os próximos desafios.", href: "/concursos", tag: "Em planejamento" },
];
const faq = [
  ["O que posso usar agora?", "O treino gratuito reúne questões oficiais do ENEM, com seleção por disciplina e sessões de 30, 60 ou 90 questões. Você pode começar sem cadastro."],
  ["O treino já mostra acertos e explicações?", "Ainda não. Os gabaritos e as resoluções estão em preparação. Por enquanto, é possível selecionar respostas e concluir a sessão, sem correção automática ou histórico persistente."],
  ["Já existe preparação para vestibulinho?", "Vestibulinhos fazem parte do foco do Gabaru. As trilhas específicas estão em construção; o treino público atual utiliza questões do ENEM."],
  ["O Gabaru já está vendendo planos?", "Não. A plataforma está em construção e as vendas continuam bloqueadas. Os recursos de diagnóstico, plano individual e revisão fazem parte da evolução planejada."],
];
export default function Home() {
  return <main className="gb-home">
    <section className="gb-hero gb-container" aria-labelledby="gb-title">
      <div className="gb-hero-copy"><p className="gb-eyebrow"><span className="gb-live-dot" /> GRANDES CONQUISTAS. UM PASSO DE CADA VEZ.</p>
        <h1 id="gb-title">Seu próximo<br />passo começa<br />com <em>uma questão.</em></h1>
        <p className="gb-lead">Um espaço para construir sua base, enfrentar desafios e ir mais longe. Preparação para vestibulinhos, ENEM e vestibulares, começando pela prática.</p>
        <div className="gb-actions"><Link className="gb-button" href="/treino">Experimentar treino grátis <span aria-hidden="true">↗</span></Link><a className="gb-text-link" href="#caminhos">Encontrar meu caminho <span aria-hidden="true">↓</span></a></div>
        <p className="gb-footnote">Sem cadastro para começar. Plataforma em construção.</p>
      </div>
      <div className="gb-hero-art" aria-label="Ilustração conceitual: etapas de aprendizado"><div className="gb-art-grid" /><span className="gb-art-label">O CONHECIMENTO ABRE CAMINHOS</span><div className="gb-orbit" /><div className="gb-step gb-step-one" /><div className="gb-step gb-step-two" /><div className="gb-step gb-step-three"><span aria-hidden="true">↗</span></div><span className="gb-art-base">PRÁTICA</span><span className="gb-art-top">POSSIBILIDADES</span><div className="gb-art-note"><span aria-hidden="true">✳</span> Cada ideia compreendida<br />é um novo ponto de partida.</div></div>
    </section>
    <div className="gb-facts"><div className="gb-container"><span>Questões oficiais do ENEM</span><span>Escolha por disciplina</span><span>Treino gratuito</span><span>Seu ritmo, seu começo</span></div></div>
    <section id="caminhos" className="gb-section gb-container" aria-labelledby="gb-paths"><div className="gb-section-intro"><div><p className="gb-eyebrow">UM OBJETIVO MUDA O CAMINHO</p><h2 id="gb-paths">Para onde você<br />quer ir?</h2></div><p>Cada prova abre uma porta diferente. Conheça os caminhos que estamos construindo e o que você já pode experimentar.</p></div>
      <div className="gb-path-grid">{paths.map(p=><Link href={p.href} className="gb-path" key={p.n}><div className="gb-path-top"><span>{p.n}</span><span aria-hidden="true">↗</span></div><p className="gb-path-tag">{p.tag}</p><h3>{p.name}</h3><p className="gb-path-exams">{p.exams}</p><p>{p.text}</p></Link>)}</div>
    </section>
    <section className="gb-practice" aria-labelledby="gb-practice-title"><div className="gb-container gb-practice-grid"><div><p className="gb-eyebrow">DISPONÍVEL PARA EXPERIMENTAR</p><h2 id="gb-practice-title">Menos tempo procurando.<br /><em>Mais tempo praticando.</em></h2><p>Escolha uma disciplina, defina o tamanho da sessão e abra sua primeira questão oficial do ENEM.</p><Link href="/treino" className="gb-button gb-button-light">Começar meu treino <span aria-hidden="true">↗</span></Link><p className="gb-practice-limit">Gabaritos e resoluções em preparação. O treino ainda não calcula acertos.</p></div><ol className="gb-practice-list"><li><span>01</span><div><h3>Escolha seu foco</h3><p>Filtre as questões pela disciplina que deseja praticar.</p></div></li><li><span>02</span><div><h3>Organize sua sessão</h3><p>Selecione 30, 60 ou 90 questões para o seu treino.</p></div></li><li><span>03</span><div><h3>Comece pela primeira</h3><p>Leia o enunciado, selecione a alternativa e avance no seu ritmo.</p></div></li></ol></div></section>
    <section className="gb-section gb-container gb-vision"><p className="gb-eyebrow">O GABARU QUE ESTAMOS CONSTRUINDO</p><h2>Entender. Praticar.<br /><em>Avançar com direção.</em></h2><div className="gb-vision-grid">{[["Diagnóstico", "Identificar as habilidades que precisam de atenção."],["Plano de estudos", "Organizar o próximo passo de acordo com o objetivo e a rotina."],["Revisão", "Retomar dificuldades e acompanhar a evolução ao longo do tempo."]].map(([t,d])=><div key={t}><span className="gb-planned">RECURSO PLANEJADO</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section className="gb-section gb-container gb-faq" aria-labelledby="gb-faq-title"><div><p className="gb-eyebrow">ANTES DE COMEÇAR</p><h2 id="gb-faq-title">Tudo às claras.</h2><p>O que já existe e o que vem pela frente.</p></div><div>{faq.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="gb-container"><div className="gb-final"><span className="gb-eyebrow">SEU PONTO DE PARTIDA</span><h2>Vamos à primeira questão?</h2><Link href="/treino" className="gb-button">Abrir treino gratuito <span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
