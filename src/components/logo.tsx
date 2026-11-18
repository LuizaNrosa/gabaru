// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
export function LogoDefs() {
  return null;
}

export function Simbolo({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 88 88" width="58" height="58"
      className={`gb-symbol ${className}`} aria-hidden="true" focusable="false">
      <g transform="rotate(-4 28 28)">
        <rect x="-11" y="-11" width="78" height="78" rx="10" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="-6" y="-6" width="68" height="68" rx="7" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M38 12A17 17 0 1 0 40 29H25V21H48V29A25 25 0 1 1 43 6Z" fill="currentColor" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`gb-wordmark ${className}`} aria-label="Gabaru">
      <Simbolo />
      <span>gabaru<span className="gb-logo-dot">.</span></span>
    </span>
  );
}
