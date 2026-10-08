/**
 * Logo GABARU, rota B "Alternativa certa": cinco letras em traço de caneta e uma
 * bolinha preenchida no U (sílaba tônica). Construção de referência da identidade
 * v1; o acabamento óptico final é do letterista.
 *
 * <LogoDefs /> entra uma vez no layout; <Wordmark /> e <Simbolo /> só referenciam.
 * A cor vem de `currentColor` (use text-ink, text-paper...).
 */
export function LogoDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="gb-cap">
          <rect x="-10" y="0" width="700" height="100" />
        </clipPath>
        <g id="gb-lG">
          <path
            d="M56.7 18.6A27 27 0 0 0 9 36V64A27 27 0 0 0 63 64V52H38"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
          />
        </g>
        <g id="gb-lA">
          <path
            d="M9 100V36A27 27 0 0 1 63 36V100M9 62H63"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
          />
        </g>
        <g id="gb-lB">
          <path
            d="M9 0V100M0 9H36A20.5 20.5 0 0 1 36 50H9M9 50H40A20.5 20.5 0 0 1 40 91H0"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
          />
        </g>
        <g id="gb-lR">
          <path
            d="M9 0V100M0 9H36A20.5 20.5 0 0 1 36 50H9M36 50L62 104"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
          />
        </g>
        <mask id="gb-mU" maskUnits="userSpaceOnUse" x="-5" y="-5" width="110" height="110">
          <rect x="-5" y="-5" width="110" height="110" fill="#fff" />
          <g transform="translate(29.1 21) scale(0.58)">
            <path
              d="M9 0V64A27 27 0 0 0 63 64V0"
              fill="none"
              stroke="#000"
              strokeWidth="24"
            />
          </g>
        </mask>
        <g id="gb-s2">
          <circle cx="50" cy="50" r="50" fill="currentColor" mask="url(#gb-mU)" />
        </g>
        <g id="gb-w2">
          <g clipPath="url(#gb-cap)">
            <use href="#gb-lG" />
            <use href="#gb-lA" x="86" />
            <use href="#gb-lB" x="172" />
            <use href="#gb-lA" x="256" />
            <use href="#gb-lR" x="342" />
          </g>
          <g transform="translate(432 0)">
            <use href="#gb-s2" />
          </g>
        </g>
      </defs>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 532 100" className={className} role="img" aria-label="GABARU">
      <use href="#gb-w2" />
    </svg>
  );
}

export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <use href="#gb-s2" />
    </svg>
  );
}
