import Link from "next/link";
import etec from "@/data/etec-exams.json";
import coluni from "@/data/coluni-exams.json";
import ifsc from "@/data/ifsc-exams.json";
import ifsp from "@/data/ifsp-exams.json";

export function VestibulinhoCollection() {
  const collections = [
    { slug: "etec", name: "ETEC", exams: etec },
    { slug: "coluni", name: "COLUNI/UFV", exams: coluni },
    { slug: "ifsc", name: "IFSC", exams: ifsc },
    { slug: "ifsp", name: "IFSP", exams: ifsp },
  ];
  return <div className="grid gap-6 md:grid-cols-2">{collections.map(c =>
    <article key={c.slug} className="gb-content-card">
      <h3>{c.name}</h3>
      <p>{c.exams.length} cadernos · {c.exams.reduce((n, e) => n + e.questions.length, 0).toLocaleString("pt-BR")} questões com gabarito oficial</p>
      <Link href={`/provas/${c.slug}`} className="gb-button mt-4">Ver todas as provas ↗</Link>
      <ul className="mt-5 grid gap-3" aria-label={`Edições recentes — ${c.name}`}>
        {c.exams.slice(0, 3).map(e => <li key={e.id}><Link className="gb-text-link" href={`/provas/${c.slug}/${e.id}`}>{e.title} · {e.questions.length} questões ↗</Link></li>)}
      </ul>
    </article>
  )}</div>;
}
