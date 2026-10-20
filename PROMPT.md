# Prompt para o Lovable: Thais Artes Gráficas

Crie uma landing page de uma página só (âncoras e abas) para a **Thais Artes Gráficas**, gráfica de Piracicaba-SP. Português do Brasil. Mobile primeiro (a maioria chega pelo Instagram e WhatsApp).

## Objetivo
O visitante entende em 5 segundos o que a gráfica faz, vê trabalhos reais e pede orçamento pelo WhatsApp.

## Regras de conteúdo (valem para todo o site)
- Proibido: "R$", "a partir de", "grátis", "promoção", desconto, prazos em dias e valores de frete. Nenhum preço.
- Não inventar depoimentos nem números.
- Não afirmar o que não foi confirmado. Use exatamente estes textos: "Combinamos o envio para outras cidades pelo WhatsApp"; "Retirada ou entrega, combinamos pelo WhatsApp"; "Impressos, brindes e peças 3D num só lugar".
- Todo botão "Pedir orçamento" abre o WhatsApp com a mesma mensagem: "Olá! Vim pelo site e quero um orçamento." (encodeURIComponent).
- Links externos com `target="_blank" rel="noopener noreferrer"`.

## Direção de design
Deve parecer feito por um estúdio de design, não por IA: editorial, como uma boutique de impressão.
- **Fundo**: alternar off-white #F6F3EE e #EDE8DF entre seções. Nunca branco puro. Texto #161616.
- **Cores da logo em doses pequenas**: magenta, azul, verde, laranja, roxo, amarelo.
  - Magenta de botões e texto: #C8006E (texto branco sobre ele passa 4.5:1). #E6007E só em filetes e decoração.
  - Amarelo #F5C400, laranja #F58220, verde #3BB54A e azul #0AA5E0 (claros): só como preenchimento, filete ou número gigante (≥72px, `aria-hidden`). Nunca texto pequeno. Roxo #7B3FC4 como filete.
  - Nunca como fundo grande nem gradiente.
  - Números dos 4 passos de "Como funciona": magenta, azul, verde, laranja, com a linha do topo na mesma cor. O texto do passo é #161616.
  - Pontinho na aba de serviço: Impressos magenta, Brindes azul, Papelaria verde, Peças 3D laranja.
  - Faixa de 5px no topo dos cards (cases e carrossel), em ciclo fixo: magenta, azul, verde, laranja, roxo, amarelo.
  - Filete multicolorido (6 cores) na base da faixa de brindes e acima do rodapé.
- **Fontes** (Google Fonts, `display=swap`): Bricolage Grotesque (títulos, 700-800) e DM Sans (texto).
- **Escalas**: H1 `clamp(2.5rem,9vw,5.5rem)` com line-height 1.02; H2 `clamp(1.75rem,5vw,3rem)`; corpo 17px/1.6, linha máx. 62ch. Caixa-alta só em rótulos de 12-13px.
- **Layout**: container máx. 1200px; seções com 96px de respiro no desktop e 56px no mobile. Assimetria só no layout das seções (texto de um lado, imagem do outro, espaçamentos variados). Toda grade de cards é SEMPRE alinhada: nenhum card mais baixo ou deslocado.
- **Acabamento**: sem box-shadow; cards com raio 2px (999px só em abas e botões); sem gradiente sobre foto; sem glassmorphism, blobs, brilhos, emojis, contadores animados nem ícones de biblioteca. Animação só de entrada: fade + translateY 12px, 400ms, uma vez. Respeitar `prefers-reduced-motion`.
- **Fotos**: retrato 4:5. Um único placeholder em todo o site: caixa cinza-papel, listras diagonais sutis, legenda "Foto em breve". Os cases usam as fotos de `/public/cases/` listadas na seção Cases. Onde não houver foto (ex. itens das abas de Serviços), usar o placeholder até eu inserir; os itens de Serviços podem reaproveitar a foto do case correspondente.
- **Acessibilidade**: foco com outline 3px #161616 offset 2px; alvos de toque ≥48px; labels visíveis; erros em texto; textos alternativos nas imagens.
- Tom: direto, humano, frases curtas e concretas. Sem "soluções inovadoras" ou "excelência e compromisso".

## Estrutura (nesta ordem; ids de âncora #servicos, #cases, #como-funciona, #contato)
1. **Cabeçalho fixo**: logo à esquerda; links Serviços, Cases, Como funciona, Contato; botão "Pedir orçamento" sempre visível. No celular, menu hambúrguer.
2. **Hero**: H1 "Gráfica em Piracicaba. Do cartão de visita ao brinde." Subtítulo: "Impressos, brindes corporativos e peças em 3D. Se você não tem a arte, a gente cria." Botões "Pedir orçamento no WhatsApp" e "Ver cases".
3. **Carrossel de cases**, logo abaixo do hero (no celular pode ficar logo após a dobra). Cabeçalho: "CASES RECENTES" e setas ← →.
   - Usa os 8 primeiros cases da lista, com os mesmos dados. Card: foto, nome (ou legenda sem nome) e produto. Clicar rola até o case na grade.
   - Autoplay lento em loop; pausa no hover, toque e foco. Setas avançam 1 card. 4 cards no desktop, 1,3 no celular. Scroll-snap e arrasto no celular. Sem autoplay com `prefers-reduced-motion`.
4. **Serviços em abas** (`role="tablist"`, roláveis no celular, trocam sem recarregar). Aba padrão: Impressos. Abas: Impressos, Brindes, Papelaria, Peças 3D. Cada item: foto (placeholder), nome e uma frase curta.
   - Impressos: cartões de visita (hot stamping e cantos arredondados), cartão fidelidade, panfletos e folders, ímãs, banners, adesivos e etiquetas, tags, crachás personalizados, placa QR Code PIX.
   - Brindes: canecas, garrafas e copos, canetas, chaveiros, bloquinhos, sacolas de algodão, brindes corporativos para eventos.
   - Papelaria: papelaria para empresas, pastas, cadernos, kits de identidade (cartão, pasta, envelope).
   - Peças 3D: peças e brindes sob medida, miniaturas e objetos personalizados.
5. **Cases**: grade alinhada com filtro Todos, Impressos, Brindes, Papelaria, 3D. Card: foto (1 ou 2; a segunda aparece no hover/toque), nome, produto e uma linha de produção.
   - Dados em um único arquivo (ex. `cases.ts`), com os campos nome, categoria, produto, detalhe, fotos e `mostrarNome` (true/false). Todos começam com `mostrarNome=true` (site modelo); com `false`, mostrar "Cliente da Thais" no lugar do nome.
   - Legenda da seção: "Trabalhos produzidos pela Thais Artes Gráficas. Marcas citadas pertencem aos seus titulares". Não usar logos oficiais.
   - Cases (categoria):
     1. Sambalelê: crachás personalizados, preto com amarelo (Impressos). Foto: `sambalele-1.webp`.
     2. Cervino Assessoria: caderno espiral e sacolas de algodão com a marca (Papelaria). Foto: `cervino-1.webp`.
     3. D.Silveira Havaianas: bloquinho kraft com caneta (Brindes). Foto: `dsilveira-1.webp`.
     4. Porto: canecas com ilustração de cada colaborador (Brindes). Foto: `porto-1.webp`.
     5. Caminho / Jaecoo: garrafinhas de água com rótulo personalizado (Brindes). Foto: `caminho-jaecoo-1.webp`.
     6. Guerra Piratruck: canecas brancas com logo (Brindes). Foto: `guerra-piratruck-1.webp`.
     7. LWART: copos de bambu com gravação (Brindes). Foto: `lwart-1.webp`.
     8. Nalco Water: chaveiros abridores e canetas (Brindes). Foto: `nalco-water-1.webp`.
     9. Elaine Longo: papelaria completa em verde, com pasta, cartões e caderno (Papelaria). Foto: `elaine-longo-1.webp`.
     10. Matheus Fernandes: papelaria e cartões em preto com verde (Papelaria). Foto: `matheus-fernandes-1.webp`.
     11. Newtrade Capital: garrafa com gravação a laser (Brindes). Foto: `newtrade-capital-1.webp`.
     12. SINO Educacional: pasta institucional (Papelaria). Foto: `sino-educacional-1.webp`.
     13. Peças 3D (vários clientes): camaleões, miniaturas e peças personalizadas (3D). Fotos: `pecas-3d-1.webp` (capa), `pecas-3d-2.webp` (hover), `pecas-3d-3.webp` e `pecas-3d-4.webp` (extras para a aba Peças 3D).
6. **Como funciona**: 4 passos grandes e numerados: 1 Você conta o que precisa pelo WhatsApp. 2 Criamos ou ajustamos a arte. 3 Produzimos. 4 Retirada ou entrega, combinamos pelo WhatsApp.
7. **Diferenciais** (texto corrido, não cards iguais): Não tem a arte? Nós criamos. Combinamos o envio para outras cidades pelo WhatsApp. Impressos, brindes e peças 3D num só lugar. "100% de recomendação em 63 avaliações no Facebook", com link para a página do Facebook e comentário no código para o dono atualizar o dado.
8. **Brindes para empresas**: faixa #161616 com texto claro (único bloco escuro do site). Chamada "Sua marca em canecas, garrafas, cadernos e mais" e botão "Pedir orçamento".
9. **FAQ curto** (sem valores): formatos de arquivo aceitos (PDF, CDR, imagem); como funciona a aprovação da arte antes de produzir; o que fazer se não tiver arte.
10. **Contato**: formulário (nome, telefone, o que precisa). Valida nome e telefone; ao enviar abre `https://wa.me/5519996989494?text=` com a mensagem (encodeURIComponent, nova aba, noopener). Texto de apoio: "Ao enviar, abrimos o WhatsApp com sua mensagem. Nada é guardado no site". Link direto alternativo para o WhatsApp.
    - Também: e-mail com `mailto:`, endereço, Instagram, Facebook. Horário: ocultar o campo até estar preenchido.
    - Mapa em iframe com `loading="lazy"` e `title`, mais o link "Abrir no Google Maps".
11. **Rodapé** mínimo: logo, redes, endereço, ano e link "Privacidade" para uma página curta: nome e telefone só são usados para atender o pedido; sem cookies nem analytics.
    - Botão flutuante de WhatsApp no canto inferior, que não pode cobrir nenhum CTA (esconder perto de botões e do formulário; reservar espaço no fim da página).

## Dados da empresa
- Nome: Thais Artes Gráficas
- Descrição: Brindes corporativos, impressos gráficos e impressão 3D.
- Endereço: Av. Suíça, 500, Jardim Europa, Piracicaba - SP, CEP 13416-403
- WhatsApp: (19) 99698-9494, https://wa.me/5519996989494
- E-mail: thaisfilardi@hotmail.com
- Instagram: https://www.instagram.com/thaisartesgraficas/ (@thaisartesgraficas)
- Facebook: https://www.facebook.com/thaisartegraficas/
- Logo: hexágono multicolorido com a letra T (arquivo que vou enviar; por enquanto um placeholder).

## Extras técnicos
- SEO: título "Thais Artes Gráficas | Gráfica em Piracicaba" e meta descrição.
- JSON-LD `LocalBusiness` com nome, telefone, e-mail, endereço, url e sameAs. SEM openingHours, priceRange nem aggregateRating.
- Carregamento rápido, imagens com lazy loading.
