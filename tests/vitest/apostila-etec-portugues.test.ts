import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import conteudo from '@/data/apostila-etec-portugues.json';
import { TextoTeoria } from '@/components/leitor-portugues-etec';

describe('apostila ETEC de Português', () => {
  it('mantém cinco alternativas e quatro distratores comentados por exemplo', () => {
    for (const [slug, capitulo] of Object.entries(conteudo)) {
      for (const exemplo of capitulo.exemplos) {
        expect(exemplo.alternativas, slug).toHaveLength(5);
        expect(exemplo.distratores, slug).toHaveLength(4);
        expect('ABCDE', slug).toContain(exemplo.correta);
      }
      for (const questao of capitulo.oficiais) expect(questao.distratores, questao.id).toHaveLength(4);
    }
  });

  it('o capítulo de compreensão e inferência tem teoria completa', () => {
    const teoria = conteudo['compreensao-e-inferencia'].teoria;
    expect(teoria.reduce((total, item) => total + item.texto.length, 0)).toBeGreaterThan(12000);
    expect(new Set(teoria.map(item => item.titulo)).size).toBe(teoria.length);
  });

  it('renderiza parágrafos e listas da teoria', () => {
    const html = renderToStaticMarkup(createElement(TextoTeoria, { texto: 'Abertura.\n\n• Um item\n• Outro item\n\nFecho.' }));
    expect(html).toBe('<p>Abertura.</p><ul class="list-disc pl-6"><li>Um item</li><li>Outro item</li></ul><p>Fecho.</p>');
  });
});
