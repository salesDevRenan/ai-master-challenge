# Lógica de scoring

> Estado atual: **hipóteses**. Cada uma será confirmada ou derrubada pela exploração (`npm run analyze`), e o resultado fica registrado na seção 5. Os pesos finais só são definidos depois disso.

## 1. O que o score precisa responder

"Se eu tenho uma hora hoje, em qual deal ela rende mais?" Isso depende de três coisas:

| Componente | Pergunta | Fonte |
|---|---|---|
| **Chance de fechar** | Esse deal tende a virar Won? | Taxas de vitória históricas por segmento |
| **Valor** | Quanto entra se fechar? | Preço do produto (deals abertos não têm `close_value`) |
| **Urgência** | Ele está esfriando? | Dias no stage atual vs. ciclo típico dos deals ganhos |

**Prioridade = chance × valor × urgência**, normalizada para 0–100 dentro do pipeline aberto.

Não ordenamos só por valor (o README proíbe), e não usamos só probabilidade: um deal de 90% de um produto barato não deve vencer um de 60% de um produto 50× mais caro.

## 2. Chance de fechar

Para cada fator (produto, setor da conta, porte da conta, vendedor, escritório), calculamos a taxa de vitória histórica com **suavização bayesiana** (encolhe segmentos com poucos deals em direção à média geral, para evitar que um vendedor com 3 deals e 3 vitórias pareça infalível).

Os fatores são combinados em **log-odds**: cada um soma ou subtrai pontos a partir da taxa geral. Esse formato é o que permite a explicação ("+8 pts: este produto fecha 71% das vezes, contra 63% da média").

## 3. Urgência e "esfriamento"

Para deals em **Engaging**: comparamos os dias desde `engage_date` com a distribuição de ciclo dos deals **ganhos**.

- Abaixo da mediana → **no ritmo**
- Entre a mediana e o percentil 75 → **janela de fechamento** (prioridade máxima: momento de empurrar)
- Acima do percentil 90 → **esfriando/parado** (alerta: revisar ou desqualificar)

Para deals em **Prospecting** (sem `engage_date`): não há relógio; o score usa só chance × valor, e a próxima ação sugerida é "agendar o primeiro contato".

## 4. Hipóteses a testar

| # | Hipótese | Como testar | Resultado |
|---|---|---|---|
| H1 | As features "óbvias" (produto, setor, porte) variam pouco a taxa de vitória | Taxa por segmento + intervalo de confiança | _pendente_ |
| H2 | O tempo no pipeline separa ganhos de perdidos melhor que as outras features | Distribuição de ciclo Won vs Lost | _pendente_ |
| H3 | O desempenho do vendedor (e vendedor × produto) é um sinal relevante | Taxa por vendedor com suavização | _pendente_ |
| H4 | Há problemas de qualidade (nome de produto divergente, deals sem conta, datas faltando) | Checagens no `build-data` | _pendente_ |
| H5 | O score final ordena melhor que "ordenar por valor" | Backtest temporal (seção 6) | _pendente_ |

## 5. Achados da exploração

_Preenchido após `npm run analyze`. Cada número aqui deve ser reproduzível pelo script._

## 6. Validação (backtest)

1. Escolher uma data de corte no meio do período.
2. Calcular `History` só com deals fechados antes do corte.
3. Pontuar os deals que estavam abertos no corte e que fecharam depois.
4. Medir: AUC (o score separa Won de Lost?), taxa de vitória por decil de score e valor capturado no top 20% vs. ordenar por valor.

Se o score não superar o baseline "ordenar por valor", o documento diz isso. Resultado honesto vale mais que métrica bonita.

## 7. Limitações conhecidas

- Dataset sintético: os padrões podem não refletir um CRM real.
- Sem dados de atividade (e-mails, reuniões), que no mundo real são o sinal mais forte.
- Deals abertos não têm valor negociado; usamos o preço de tabela do produto.
