// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
export function LogoDefs(){return null;}
/** Existing geometric G from the editable archive covers; no raster approximation. */
export function Simbolo({className}:{className?:string}){return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="58" height="58" className={className} aria-hidden="true" focusable="false"><path d="M38 12A17 17 0 1 0 40 29H25V21H48V29A25 25 0 1 1 43 6Z" fill="#123d35"/></svg>;}
export function Wordmark({className}:{className?:string}){return <span className={`gb-wordmark ${className??''}`} aria-label="Gabaru"><Simbolo className="gb-symbol"/><span>gabaru<span className="gb-logo-dot">.</span></span></span>;}
