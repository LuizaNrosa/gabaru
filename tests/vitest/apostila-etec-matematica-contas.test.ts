import katex from 'katex';
import { describe, expect, it } from 'vitest';
import contas from '../../specs/apostila-etec/contas-matematica.json';
import matematica from '@/data/apostila-etec-matematica.json';

/** Avalia só aritmética (números, + - * / e parênteses), sem eval. */
function calcular(expressao: string): number {
  const tokens = expressao.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? [];
  let i = 0;
  const fator = (): number => {
    const t = tokens[i++];
    if (t === '(') { const v = soma(); i++; return v; }
    if (t === '-') return -fator();
    return Number(t);
  };
  const produto = (): number => {
    let v = fator();
    while (tokens[i] === '*' || tokens[i] === '/') v = tokens[i++] === '*' ? v * fator() : v / fator();
    return v;
  };
  const soma = (): number => {
    let v = produto();
    while (tokens[i] === '+' || tokens[i] === '-') v = tokens[i++] === '+' ? v + produto() : v - produto();
    return v;
  };
  return soma();
}

describe('auditoria numérica da apostila de Matemática', () => {
  it('recalcula todas as contas registradas', () => {
    for (const [capitulo, lista] of Object.entries(contas)) {
      for (const { rotulo, conta, esperado } of lista) {
        const valor = calcular(conta);
        expect(Math.abs(valor - esperado), `${capitulo} · ${rotulo}: ${conta} = ${valor}`).toBeLessThanOrEqual(Math.max(0.05 * Math.abs(esperado), 1e-9));
      }
    }
  });

  it('cada capítulo tem ao menos 10 oficiais, 5 autorais e contas para todos os exemplos', () => {
    for (const [slug, capitulo] of Object.entries(matematica)) {
      expect(capitulo.oficiais.length, slug).toBeGreaterThanOrEqual(10);
      expect(capitulo.exemplos.length, slug).toBeGreaterThanOrEqual(5);
      const rotulos = new Set((contas as Record<string, { rotulo: string }[]>)[slug]?.map(c => c.rotulo));
      capitulo.exemplos.forEach((_, n) => expect(rotulos.has(`exemplo-${n + 1}`), `${slug} exemplo ${n + 1}`).toBe(true));
      ((capitulo as { fixacao?: unknown[] }).fixacao ?? []).forEach((_: unknown, n: number) => expect(rotulos.has(`fixacao-${n + 1}`), `${slug} fixação ${n + 1}`).toBe(true));
    }
  });

  it('todas as fórmulas compilam no KaTeX', () => {
    const coletar = (valor: unknown): string[] => typeof valor === 'string' ? [valor]
      : Array.isArray(valor) ? valor.flatMap(coletar)
      : valor && typeof valor === 'object' ? Object.values(valor).flatMap(coletar) : [];
    for (const texto of coletar(matematica)) {
      for (const [, bloco, inline] of texto.matchAll(/\$\$([\s\S]+?)\$\$|(?<![\p{L}\p{N}])\$(?!\s)([^$\n]+?)(?<!\s)\$/gu)) {
        expect(() => katex.renderToString(bloco ?? inline, { throwOnError: true, strict: 'error' }), bloco ?? inline).not.toThrow();
      }
    }
  });

  it('o avaliador respeita a precedência', () => {
    expect(calcular('2 + 3 * 4')).toBe(14);
    expect(calcular('(2 + 3) * 4')).toBe(20);
    expect(calcular('10 / 4 - 1')).toBe(1.5);
  });
});
