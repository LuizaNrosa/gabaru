/**
 * Renderiza um bloco JSON-LD. O conteúdo deve corresponder a conteúdo
 * real e visível da página — nada de esquema decorativo ou falso.
 */
export function JsonLd({ dados }: { dados: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
