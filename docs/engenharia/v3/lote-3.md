# Lote 3 — resgate documental

Baseline real: 16.299 registros, dos quais 16.129 estavam em quarentena; 146 Tier 1 e 24 Tier 2. A alegação de 16.299 em quarentena não correspondia ao catálogo.

O pipeline local `node scripts/resgatar-quarentena.mjs` promoveu 116 para Tier 1, sem inventar resoluções. Resultado: 16.013 Tier 0, 262 Tier 1, 24 Tier 2. Motivos sobrepostos, edições e recusas estão em `lote-3-placar.json`.

Cada promoção exige SHA-256 dos PDFs de prova e gabarito, gabarito integral compatível com a versão do caderno e coincidência literal normalizada do enunciado e de todas as alternativas, na ordem, dentro do bloco numerado. Referências a textos compartilhados e recursos visuais ficam retidas. O overlay é invalidado se o arquivo fonte ou fingerprint mudar. FUVEST 2001 V/T continua suspensa também nas questões individuais.

O diagnóstico não encontrou cabeçalhos repetidos nem questões bilíngues concatenadas; não foram criadas divisões especulativas. Há adaptadores testados para idiomas e fontes offline ENEM 2000–2008, mas nenhum dataset sem prova de origem/licença/hash foi utilizado. Fórmulas simples passam pelo parser KaTeX; subtração ambígua não vira expoente.

O leitor agora usa manifesto estático gerado no prebuild em vez de consultar WebP no filesystem da função. As imagens continuam servidas como assets públicos. As bibliotecas opcionais de canvas do jsdom são excluídas das funções; a sanitização e a renderização permanecem sujeitas aos testes e ao build.

Na revisão final, o adapter 2000–2008 foi corrigido para português como padrão: esse período do ENEM antecede as questões de língua estrangeira de 2010. Idiomas não são inferidos por número; pares posteriores explícitos continuam separados sem herdar gabarito de outra língua.
