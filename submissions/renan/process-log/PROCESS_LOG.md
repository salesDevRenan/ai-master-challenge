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

---

## Fase 1 — Dados

_..._
