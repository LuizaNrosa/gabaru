import Image from "next/image";

// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
export function Simbolo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/marca/gabaru-carimbo.svg"
      alt=""
      width={1097}
      height={1080}
      className={`gb-symbol ${className}`}
      unoptimized
    />
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`gb-wordmark ${className}`}>
      <Simbolo />
      <span>gabaru</span>
    </span>
  );
}
