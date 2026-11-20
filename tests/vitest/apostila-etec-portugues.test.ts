import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import portugues from '@/data/apostila-etec-portugues.json';
import ciencias from '@/data/apostila-etec-ciencias.json';
import historia from '@/data/apostila-etec-historia.json';
import geografia from '@/data/apostila-etec-geografia.json';

const conteudo = { ...portugues, ...ciencias, ...historia, ...geografia };
import { TextoTeoria } from '@/components/leitor-portugues-etec';

describe('apostila ETEC de Português', () => {
  it('mantém cinco alternativas e quatro distratores comentados por exemplo', () => {
    for (const [slug, capitulo] of Object.entries(conteudo)) {
      for (const exemplo of [...capitulo.exemplos, ...((capitulo as { fixacao?: typeof capitulo.exemplos }).fixacao ?? [])]) {
        expect(exemplo.alternativas, slug).toHaveLength(5);
        expect(exemplo.distratores, slug).toHaveLength(4);
        expect('ABCDE', slug).toContain(exemplo.correta);
      }
      for (const questao of capitulo.oficiais) expect(questao.distratores, questao.id).toHaveLength(4);
    }
  });

  it('o capítulo de compreensão e inferência tem teoria completa', () => {
    const teoria = portugues['compreensao-e-inferencia'].teoria;
    expect(teoria.reduce((total, item) => total + item.texto.length, 0)).toBeGreaterThan(12000);
    expect(new Set(teoria.map(item => item.titulo)).size).toBe(teoria.length);
  });

  it('capítulos de Ciências e História têm ao menos 10 oficiais e 5 autorais', () => {
    for (const [slug, capitulo] of Object.entries({ ...ciencias, ...historia, ...geografia })) {
      expect(capitulo.oficiais.length, slug).toBeGreaterThanOrEqual(10);
      expect(capitulo.exemplos.length, slug).toBeGreaterThanOrEqual(5);
      expect(new Set(capitulo.oficiais.map(q => q.id)).size, slug).toBe(capitulo.oficiais.length);
    }
  });

  it('capítulos com fixação têm 12 exercícios de enunciado único', () => {
    for (const [slug, capitulo] of Object.entries(conteudo)) {
      const fixacao = (capitulo as { fixacao?: { comando: string; suporte: string[] }[] }).fixacao;
      if (!fixacao) continue;
      expect(fixacao, slug).toHaveLength(12);
      expect(new Set(fixacao.map(f => f.suporte.join() + f.comando)).size, slug).toBe(12);
    }
  });

  it('renderiza parágrafos e listas da teoria', () => {
    const html = renderToStaticMarkup(createElement(TextoTeoria, { texto: 'Abertura.\n\n• Um item\n• Outro item\n\nFecho.' }));
    expect(html).toBe('<p>Abertura.</p><ul class="list-disc pl-6"><li>Um item</li><li>Outro item</li></ul><p>Fecho.</p>');
  });
});
