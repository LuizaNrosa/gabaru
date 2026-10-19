/** Identidade proposta: um G aberto, com degrau de avanço. SVG independente. */
export function LogoDefs() {
  return null;
}
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M38 12A17 17 0 1 0 40 29H25V21H48V29A25 25 0 1 1 43 6Z"
        transform="translate(3 4) scale(.85)"
        fill="currentColor"
      />
    </svg>
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
