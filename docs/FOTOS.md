# Fotos de universidades e instituições

Arquivos em `public/universidades/`:

| Arquivo | Uso | Estado |
|---|---|---|
| `usp.jpg` | cartão USP (home e pré-vestibulinho) | pronto |
| `unicamp.jpg` | cartão Unicamp | pronto |
| `unesp.jpg` | cartão Unesp | pronto |
| `cps.png` | logo do Centro Paula Souza (cartão branco, sem recorte) | pronto |
| `federal.jpg` | cartão de universidades federais (retrato 4:5, até 400 KB) | pendente, o cartão fica fora da home até existir |

Enquanto uma foto não existir, o cartão mostra o fundo de tinta e o nome. Os cartões sem foto ficam fora das páginas (filtro por `slug` em `src/app/page.tsx` e `src/app/pre-vestibulinho/page.tsx`).

Regras de uso:

- Só imagens com licença que permita uso comercial: fotos próprias, bancos pagos ou Wikimedia Commons com atribuição quando exigida.
- Se a licença pedir crédito, adicione o crédito na legenda em `src/components/ui.tsx` (`FotoUniversidade`).
- Não use fotos de sites de universidades nem de cursinhos concorrentes.
- Logos de instituições são marcas registradas. Antes do lançamento, confirme com a instituição ou com um advogado se o uso como referência de prova está autorizado.
