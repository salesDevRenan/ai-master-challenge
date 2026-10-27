# Direção de design

> A direção visual final é escolhida **por mim (humano)** a partir de propostas geradas com a skill `bencium-innovative-ux-designer`. Este arquivo registra o briefing, a escolha e o sistema resultante.

## 1. Briefing

- **Usuário:** vendedor B2B, não técnico, abre a ferramenta na segunda de manhã ou no celular entre reuniões.
- **Tarefa principal:** escolher os próximos 3–5 deals para trabalhar e entender o motivo em segundos.
- **Tom:** confiante, direto, de "sala de guerra comercial" — não de painel de BI.
- **O que evitar:** cara de template (cards cinza arredondados, gradiente roxo, shadcn padrão, KPI genérico no topo), tabelas sem hierarquia, score sem contexto.
- **Elemento memorável (um só):** _a definir na escolha da direção_ — candidatos: o "termômetro" de esfriamento do deal; a lista do dia tratada como uma pauta editorial; a decomposição do score como um recibo.

## 2. Processo

1. Gerar direções tipográficas isoladas (só tipo, cor e espaço) com `bencium-innovative-ux-designer`.
2. Escolher uma e registrar o motivo aqui.
3. Formalizar tokens no `@theme` do Tailwind v4 (cor, tipo, espaçamento, raio, movimento).
4. Construir as telas com `frontend-design` + `ui-typography`.
5. Auditar com `design-audit` e `web-design-guidelines` antes de entregar.

## 3. Direção escolhida

_Pendente._

## 4. Tokens

_Pendente: registrados aqui e em `solution/src/app/globals.css`._

## 5. Requisitos não negociáveis

- Contraste WCAG AA, foco visível, teclado em tudo.
- Funciona em 375 px de largura sem rolagem horizontal.
- Modo claro e escuro com tokens próprios (não inversão automática).
- `prefers-reduced-motion` respeitado.
- Tipografia correta em pt-BR (aspas curvas, travessão, números tabulares em colunas de valor).
