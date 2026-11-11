/**
 * Renderiza um bloco JSON-LD. O conteúdo deve corresponder a conteúdo
 * real e visível da página — nada de esquema decorativo ou falso.
 */
export function JsonLd({ dados }: { dados: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
