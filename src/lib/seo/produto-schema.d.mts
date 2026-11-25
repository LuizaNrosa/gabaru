// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
export declare const DIAS_ARREPENDIMENTO: number;
export declare function produtoDigitalSchema(p: {
  siteUrl: string;
  url: string;
  nome: string;
  descricao: string;
  imagens: string[];
  precoCentavos: number;
  vendaAberta: boolean;
  avaliacoes?: {media: number; total: number} | null;
}): Record<string, unknown>;
