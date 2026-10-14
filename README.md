# Gesso Insights

Crie um app web mobile-first em português do Brasil chamado "JM Gesso · Anúncios", um painel de métricas de anúncios para o dono de uma loja de gesso e drywall. Uma única tela, pensada para iPhone, que funcione como PWA (manifest, ícone de tela inicial, tela cheia, tema azul #1F4FD8, fundo #F4F6FA, fonte Inter).

Layout, de cima para baixo:

1. Cabeçalho com logo da loja (placeholder) e "Semana X de 8 · Instagram, Facebook e Google".

2. Card "Investido nesta semana": valor grande (ex.: R$ 87,50 de R$ 125,00), barra de progresso e "Hoje: R$ 9,40".

3. Dois cards lado a lado: "Cliques" e "Conversas no WhatsApp" (número grande, a conversa em verde).

4. Card "Custo por conversa" com o valor grande e, embaixo, dois blocos lado a lado: "Instagram e Facebook" (azul claro) e "Google" (turquesa claro), cada um com investido, cliques e conversas.

5. Rodapé: "Atualizado às HH:MM".

6. Três abas na parte inferior: Hoje, Semana, Anúncios (só Hoje precisa funcionar agora; as outras podem mostrar a lista de dias da semana e a lista de campanhas).

Dados: leia de um CSV público cuja URL vem da variável de ambiente VITE_DATA_CSV_URL, com colunas: data, origem (meta ou google), gasto, cliques, conversas, campanha. Se a variável não existir, use dados de exemplo e mostre a etiqueta "EXEMPLO · números ilustrativos". Atualize os dados ao abrir o app e a cada 5 minutos. Meta semanal fixa de R$ 125,00. Formate moeda em R$ com vírgula. Sem login, sem backend. Código simples e organizado, com os cálculos em um arquivo separado.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85962cd2-8e24-46de-9974-da1651c0b8e4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
