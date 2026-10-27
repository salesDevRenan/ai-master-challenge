# Plano e registro de tempo

O G4 recomenda 4–6 h e diz que horas extras não valem pontos. Meta: **≤ 6 h**, registrando o tempo real de cada fase.

| # | Fase | Time-box | Entregável | Tempo real |
|---|---|---|---|---|
| 0 | Escolha do desafio, skills, arquitetura e docs | 0:30 | Este conjunto de docs | _ |
| 1 | Dados: download, `build-data`, checagens de qualidade | 0:30 | `pipeline.json` + achados H4 | _ |
| 2 | Exploração + motor de score + backtest | 1:15 | `analyze.ts`, `SCORING.md` seção 5–6 preenchida, testes | _ |
| 3 | Direção visual (propostas → escolha → tokens) | 0:30 | `DESIGN.md` seções 3–4 | _ |
| 4 | UI: hoje, pipeline, painel do deal, time, metodologia | 2:15 | App rodando | _ |
| 5 | Auditoria de design e acessibilidade, ajustes | 0:20 | Correções | _ |
| 6 | Deploy, README final, process log, PR | 0:40 | URL pública + PR aberto | _ |
| | **Total** | **6:00** | | _ |

## Regra de corte

Se uma fase estourar o time-box em mais de 50%, corto escopo na ordem: `/time` → deals parecidos no painel → modo escuro. Nunca corto: explicação do score, filtros por vendedor/manager/região e o backtest.
