import Image from "next/image";
import manifest from "@/data/capas-manifesto.json";

const covers = new Set(manifest.generated
  .filter(({ file }) => file.startsWith("public/capas/mini-capa-"))
  .map(({ file }) => file.slice("public".length)));

export function ExamCover({ banca, className }: { banca: string; className: string }) {
  const src = `/capas/mini-capa-${banca}.svg`;
  if (!covers.has(src)) return null;

  return <Image src={src} width={320} height={452} className={className} alt="" unoptimized />;
}
