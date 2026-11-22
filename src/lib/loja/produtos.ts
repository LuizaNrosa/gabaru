// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {z} from 'zod';
import type {ProdutoId} from '@/lib/billing/types';

/** Catálogo de produtos avulsos. O preço só existe aqui, no servidor: o navegador envia apenas o id. */
export type Produto = {id: ProdutoId; titulo: string; descricaoPix: string; precoCentavos: number; caminho: string};

export const produtos: Record<ProdutoId, Produto> = {
  'apostila-matematica-etec': {
    id: 'apostila-matematica-etec',
    titulo: 'Apostila de Matemática · Vestibulinho ETEC',
    descricaoPix: 'Gabaru: Apostila de Matemática ETEC (acesso vitalício)',
    precoCentavos: 1500,
    caminho: '/apostilas/matematica-etec',
  },
};

export const compraSchema = z.object({produto: z.enum(['apostila-matematica-etec']), requestId: z.uuid()}).strict();

export const precoBRL = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
