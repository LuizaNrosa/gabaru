import Link from "next/link";
import type { Prova } from "@/data/provas";
export function PathCards({ items }: { items: Prova[] }) {
  return (
    <div className="gb-content-grid">
      {items.map((p) => (
        <Link
          key={p.slug}
          href={`/provas/${p.slug}`}
          className="gb-content-card"
        >
          <span className="gb-eyebrow">
            {["etec", "coluni", "ifsc", "ifsp", "unesp", "unicamp"].includes(p.slug)
              ? "ACERVO DISPONÍVEL ↗"
              : "TRILHA EM CONSTRUÇÃO ↗"}
          </span>
          <h3>{p.nome}</h3>
          <p>{p.completo}</p>
          <p>{p.resumo}</p>
        </Link>
      ))}
    </div>
  );
}
