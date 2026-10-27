# Process log

Registro cronológico de como usei IA. Cada entrada: o que pedi, o que a IA fez, onde errou e o que eu decidi.

**Ferramentas:** Claude Code (app desktop, modelo Claude Opus) como agente principal: leitura do repositório, código, análise e docs. Skills instaladas no Claude Code para design e boas práticas de React (lista abaixo).

---

## Fase 0 — Escolha do desafio e preparação (27/10/2026)

**1. Escolha do desafio.** Pedi ao Claude Code para clonar o repositório e comparar os 4 desafios. Ele leu os READMEs, o guia de submissão e o CONTRIBUTING e recomendou o 003. Os motivos foram o entregável ser software (o que o G4 valoriza explicitamente), o git history servir como process log e a aderência ao meu trabalho com geração de leads B2B (Leads4b).

**2. Decisões minhas sobre o rumo:**
- Priorizar interface: UI diferenciada, pronta para produção e com estética marcante.
- Stack: Node, React, TypeScript e Tailwind CSS.
- Instalar skills de design e de React antes de escrever código, para não cair no visual genérico de IA.

**3. Instalação das skills.** Pedi a instalação a partir de `anthropics/skills`, `bencium/bencium-marketplace` e `vercel-labs/agent-skills`. O Claude leu cada `SKILL.md` antes de instalar e selecionou só as relevantes:
- `frontend-design` (Anthropic)
- `bencium-innovative-ux-designer`, `ui-typography`, `design-audit` (bencium)
- `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines` (Vercel)

Ficaram de fora as skills duplicadas ou fora do escopo: `bencium-impact-designer`, que deriva do `frontend-design`; `bencium-controlled-ux-designer`, que conflita com a direção inovadora; as convenções pessoais do autor; e `deploy-to-vercel`, que executa scripts de shell. O deploy será feito manualmente.

**Problema encontrado:** o primeiro clone falhou com `Filename too long`, o limite de 260 caracteres de caminho do Windows. A correção foi clonar em um caminho curto com `core.longpaths=true`.

**4. Armadilha do repositório.** O `.gitignore` da raiz do repositório do G4 ignora `submissions/`. Um `git add .` não incluiria nada da submissão, e o PR iria vazio. Como as regras proíbem alterar arquivos fora da minha pasta, a solução é `git add -f submissions/renan` (registrado no `CLAUDE.md`).

**5. Arquitetura.** Docs criados antes do código: `ARCHITECTURE.md`, `SCORING.md` com as hipóteses a validar, `DESIGN.md` e `PLAN.md` com time-box. A decisão central é ter um único motor de scoring em TypeScript, usado tanto pela análise/backtest quanto pela UI.

**6. Diferenciais vs. baseline.** Lembrei o Claude de que o G4 já rodou o desafio em vários modelos, inclusive o mesmo que estou usando. Pedi uma solução que fosse além disso. Resultado: `docs/DIFFERENTIALS.md`, que descreve o que o baseline entrega e define 9 diferenciais, com 4 que não saem do escopo.

**7. Fork e push.** O Claude fez o fork pelo Chrome (extensão Claude in Chrome) na conta `salesDevRenan`. O primeiro push falhou com 403: o Git Credential Manager usava a credencial salva de outra conta (`Leads4b`). A correção foi colocar o usuário na URL do remote (`https://salesDevRenan@github.com/...`), o que fez o GCM usar a credencial certa. O remote do G4 ficou como `upstream`.

---

## Fase 1 — Dados (27/10/2026)

**1. Download.** O Claude baixou o zip do Kaggle pelo Chrome. Na primeira tentativa o Kaggle pediu login, e eu fiz o login manualmente. O zip trouxe também um `metadata.csv` (dicionário de campos), que não é usado pelo app.

**2. Scaffold.** `create-next-app` gerou Next.js 16 + React 19 + Tailwind v4. Vieram dois problemas:
- O `vitest` 5 exige `@types/node` ≥ 22 e o template trazia a versão 20, o que gerou conflito de peer dependency. Resolvido subindo para `@types/node@24`, em linha com o Node 24 instalado.
- **Erro do Claude que eu peguei:** para contornar o `.gitignore` da raiz, ele usou `git add -f submissions/renan`, o que forçou também o `node_modules` inteiro no stage (3 MB só de listagem). Desfeito com `git reset`. Criamos o `git-add.sh`, que força só os arquivos que o `.gitignore` da solução não ignoraria.

**3. Perfil dos dados antes de codar.** Antes de escrever o parser, pedi um perfil rápido das 4 tabelas. Ele confirmou a hipótese H4 e trouxe um achado que eu não esperava: **68% dos deals abertos não têm conta associada**. Isso muda o desenho do score: setor e porte da conta não podem ser o núcleo, porque faltam para a maioria do pipeline. Registrado em `docs/SCORING.md` §5.1.

**4. Parser de dados (`build-data`).** Parser com validação Zod (erro com arquivo, linha e campo), normalização (GTXPro, technolgy), join das 4 tabelas e relatório de qualidade gerado junto com o dataset. Os testes pegaram um caso de borda real: sem nenhuma data no pipeline, o cálculo da data de referência quebrava com um erro genérico do JavaScript. Agora ele falha com uma mensagem clara.

---

## Fase 2 — Exploração, motor de score e backtest (27/10/2026)

**1. Explorar antes de pontuar.** Antes de escrever o score, pedi a taxa de vitória por cada fator, os ciclos de Won e de Lost e a idade dos deals abertos. O resultado derrubou metade do plano original:
- Produto, setor, porte, escritório e manager variam só entre 60% e 65%, dentro do ruído (H1 confirmada).
- O vendedor parecia forte (55% a 70%), mas o qui-quadrado é compatível com taxas iguais, e a correlação entre semestres é fraca (H3 rejeitada).
- **Nenhum deal fechado levou mais de 138 dias, e 81% dos deals em Engaging já passaram disso.**

**2. O que eu decidi com base nisso:**
- **Não usar pesos fixos.** Pesos aprendidos por Bayes empírico: o próprio dado zera os fatores que são ruído.
- **Não mostrar ranking de vendedores.** Puniria pessoas por sorte. Também descartei a ideia de sugerir pareamento com o "vendedor que ganha mais no produto", que estava no `DIFFERENTIALS.md`.
- **Criar a fila de "parados"** como a principal alavanca de "parar de perder tempo".

**3. Erro da IA pego na revisão.** Na primeira versão do `SCORING.md`, o Claude citou números de scripts exploratórios avulsos: correlação de 0,10 entre semestres e faixas de escritório e manager. Pela regra do projeto, todo número precisa ser reproduzível pelo `npm run analyze`. Ao mover o cálculo para o script, a correlação deu **0,32**, não 0,10, porque a data que divide os semestres era diferente. O doc foi corrigido para o valor reproduzível. Lição: número de exploração rápida não vai para documento sem passar pelo script oficial.

**4. Backtest e o resultado incômodo.** Em 3 datas de corte, a chance de fechar ficou com AUC ≈ 0,5: nenhum modelo, nem a "taxa do vendedor", prevê ganho vs. perda neste CRM. Em vez de esconder, reescrevi a tese: priorizar pelo que é sabível. O valor esperado captura cerca de 50% da receita no top 20% (2,5× o acaso), e a regra de "parado" tira do topo os deals mortos, que seriam 47% do top 20% numa ordenação só por preço. A limitação de que a regra de parado não pôde ser validada no backtest está documentada.

**5. Teste que garante a explicação.** Há um teste automatizado verificando que a soma dos pontos percentuais dos fatores fecha exatamente com a chance exibida. É o que permite mostrar o "recibo" do score sem arredondamento mentiroso.
