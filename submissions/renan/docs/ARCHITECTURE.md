# Arquitetura — Lead Scorer (Challenge 003)

> Documento vivo. Decisões marcadas com **[A VALIDAR]** dependem da exploração dos dados (ver [SCORING.md](./SCORING.md)).

## 1. Objetivo do produto

Uma ferramenta que o vendedor abre na segunda-feira de manhã e, em menos de 30 segundos, sabe **quais deals atacar, em que ordem e por quê**. O manager usa a mesma ferramenta para ver quais deals do time estão esfriando e onde fazer coaching.

Princípios que guiam cada decisão:

1. **Decisão > dado.** Toda tela responde a uma pergunta ("onde foco hoje?"), não apenas mostra uma tabela.
2. **Explicabilidade obrigatória.** Nenhum score aparece sem os fatores que o compõem, em linguagem de vendedor.
3. **Uma única fonte de verdade.** O mesmo motor de scoring roda na análise, no backtest e na interface.
4. **Roda com um comando.** Clone → `npm install` → `npm run dev`. Dados incluídos no repositório (licença CC0).

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | Node.js (LTS ≥ 20) | Um único ecossistema para análise, motor e UI |
| Linguagem | TypeScript (`strict`) | Tipos do domínio (Deal, Score, Fator) compartilhados entre script e UI |
| Framework | Next.js (App Router) + React 19 | Server Components leem os dados no servidor; zero API própria para manter |
| Estilo | Tailwind CSS v4 | Tokens de design no `@theme`, sem biblioteca de componentes genérica |
| Validação de dados | Zod | Falha cedo e com mensagem clara se o CSV vier fora do esperado |
| Parsing CSV | `papaparse` | Robusto, tipado, sem dependência nativa |
| Gráficos | SVG próprio (ou `visx` se necessário) | Gráficos pequenos e sob medida combinam com a direção visual; evita o "look" de dashboard genérico |
| Testes | Vitest | Testes do motor de scoring e do parser |
| Lint/format | ESLint + Prettier | Padrão do ecossistema |
| Deploy | Vercel | URL pública para o avaliador abrir sem instalar nada |

Fora de escopo de propósito: banco de dados, autenticação, ML pesado (XGBoost etc.). A Head de RevOps pediu algo **útil**; o dataset tem ~8.800 linhas e cabe em memória.

## 3. Estrutura de pastas

```
submissions/renan/
├── README.md                  ← submissão (template do G4)
├── CLAUDE.md                  ← instruções para o Claude Code neste projeto
├── docs/
│   ├── ARCHITECTURE.md        ← este arquivo
│   ├── SCORING.md             ← lógica de score, hipóteses e validação
│   ├── DESIGN.md              ← direção visual e telas
│   └── PLAN.md                ← plano com time-box e registro de horas
├── process-log/
│   ├── PROCESS_LOG.md         ← narrativa: o que pedi à IA, onde ela errou, o que corrigi
│   ├── screenshots/
│   └── chat-exports/
└── solution/                  ← app Next.js
    ├── data/
    │   ├── raw/               ← CSVs do Kaggle, sem alteração
    │   └── generated/         ← dataset.json gerado por `npm run data` (gitignored)
    ├── scripts/
    │   ├── build-data.ts      ← CSV → valida → normaliza → enriquece → JSON
    │   └── analyze.ts         ← exploração + backtest → docs/FINDINGS.md
    ├── src/
    │   ├── domain/            ← tipos e constantes do negócio (sem React)
    │   ├── lib/
    │   │   ├── data/          ← loaders, schemas Zod, normalização
    │   │   └── scoring/       ← motor de score puro + explicações
    │   ├── app/               ← rotas Next.js
    │   └── components/        ← UI
    └── tests/
```

## 4. Fluxo de dados

```
data/raw/*.csv
   │  scripts/build-data.ts  (roda no `prebuild` e no `predev`)
   ▼
1. Parse (papaparse) + validação (Zod)  → erros de schema param o build
2. Normalização                          → "GTXPro" → "GTX Pro", "technolgy" → "technology"
3. Join                                  → deal + conta + produto + vendedor/manager/escritório
4. Estatísticas históricas               → taxas de vitória e ciclos, só com deals fechados
5. Scoring dos deals abertos             → score, valor esperado, fatores explicativos
   ▼
data/generated/pipeline.json  →  lido por Server Components  →  UI
```

**Data de referência ("hoje").** O dataset termina em uma data fixa no passado. O sistema usa como "hoje" a maior data presente nos dados (configurável em `src/domain/config.ts`). Isso fica explícito na interface ("Pipeline em 31/12/2017") para ninguém achar que é bug.

**Sem vazamento de informação.** As estatísticas usadas para pontuar deals abertos vêm apenas de deals já fechados. No backtest, as estatísticas são calculadas só com deals fechados **antes** do corte temporal.

## 5. Motor de scoring (`src/lib/scoring`)

Funções puras, sem I/O, 100% testáveis:

```ts
buildHistory(closedDeals): History                  // taxas e ciclos por segmento
scoreDeal(deal, history, refDate): ScoredDeal        // probabilidade, urgência, valor esperado
explain(scored): Factor[]                            // fatores em pontos, ordenados por impacto
rankPipeline(deals, history, refDate): ScoredDeal[]  // ordenação final por prioridade
```

`ScoredDeal` carrega tudo que a UI precisa: `score` (0–100), `winProbability`, `expectedValue`, `daysInStage`, `status` ("no ritmo" / "esfriando" / "parado"), `factors[]` (cada um com rótulo em português, peso e direção), `nextAction` (texto curto).

Detalhes da lógica e do plano de validação em [SCORING.md](./SCORING.md).

## 6. Telas

| Rota | Para quem | Pergunta que responde |
|---|---|---|
| `/` | Vendedor | "Onde eu foco hoje?" — top deals priorizados, com motivo em uma linha |
| `/pipeline` | Vendedor e manager | Todos os deals abertos, com filtros e ordenação |
| `/deal/[id]` (painel lateral) | Vendedor | "Por que esse score?" — decomposição dos fatores e deals parecidos que ganharam ou perderam |
| `/time` | Manager | "Qual deal do meu time está esfriando e com quem converso?" |
| `/metodologia` | Avaliador e RevOps | Como o score funciona e o resultado do backtest |

Filtros (vendedor, manager, escritório, stage, produto) vivem na **URL** (`searchParams`): o link é compartilhável e o botão voltar funciona.

## 7. Qualidade e produção

- Acessibilidade: navegação por teclado, foco visível, contraste AA, `prefers-reduced-motion` respeitado.
- Responsivo até 375 px (vendedor no celular entre reuniões).
- Textos em pt-BR; valores em US$, a moeda do dataset.
- Performance: Server Components por padrão; Client Components só onde há interação (filtros, painel lateral).
- Testes: motor de scoring (casos de borda: deal sem conta, Prospecting sem data, produto desconhecido) e parser.
- Skills do Claude Code usadas: `frontend-design`, `bencium-innovative-ux-designer`, `ui-typography`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `design-audit`.

## 8. Como escalar (para a seção de Limitações)

- Trocar os CSVs por um conector do CRM (Salesforce/HubSpot) com sync diário.
- Registrar o resultado dos deals pontuados para recalibrar os pesos com dados reais (loop de feedback).
- Notificação semanal por e-mail/Slack com o top 5 de cada vendedor.
- Quando houver atividades (e-mails, reuniões), elas viram o fator mais forte do score.
