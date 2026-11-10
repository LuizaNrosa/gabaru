// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import Image from "next/image";

export function LogoDefs() {
  return null;
}
export function Simbolo({ className }: { className?: string }) {
  return (
    <Image
      src="/marca/gabaru-carimbo.webp"
      width={256}
      height={256}
      className={className}
      alt=""
      aria-hidden="true"
    />
  );
}
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`gb-wordmark ${className ?? ""}`} aria-label="Gabaru">
      <Simbolo className="gb-symbol" />
      <span>
        gabaru<span className="gb-logo-dot">.</span>
      </span>
    </span>
  );
}
