# O que esta solução faz que o baseline não faz

O G4 já rodou este desafio em vários modelos (Claude, GPT, Gemini). Colando o brief, o resultado previsível é um app com:

- um score de **pesos inventados** ("stage 30%, valor 25%, ...") sem nenhuma validação;
- uma tabela ordenada pelo score, com filtros e um card de KPIs no topo;
- uma "explicação" que repete os pesos ("score alto porque o valor é alto");
- visual de template (cards cinza, gradiente, componentes padrão).

Esse é o piso. Cada item abaixo existe para ficar **acima** dele e responde a uma frase da Head de RevOps.

## 1. Um score provado, não apenas declarado

> *"Preciso de algo funcional."*

- **Backtest temporal:** o score é calculado com dados até uma data de corte e avaliado nos deals que fecharam depois.
- **Comparação com alternativas ingênuas:** ordenar por valor, ordenar por stage, ordem aleatória. A tela `/metodologia` mostra quanto valor cada estratégia teria capturado no top 20% do pipeline.
- **Calibração:** "70% de chance" precisa significar ~70% de vitória observada. Mostramos a curva.
- Se alguma feature "óbvia" não discrimina nada, isso é dito e ela sai do score. O baseline nunca descobre isso, porque não olha os dados.

## 2. O que largar, não só o que atacar

> *"Gastam tempo demais em deals que não vão fechar."*

O baseline só ordena. Aqui existe uma lista explícita de **deals para desqualificar ou revisar**: deals parados muito além do ciclo em que os ganhos costumam fechar e com baixa chance. Liberar tempo é metade do problema.

## 3. O momento certo, não só o deal certo

> *"Deixam oportunidades boas esfriar."*

Modelo de **janela de fechamento**: com base no ciclo dos deals ganhos, cada deal aberto recebe um status (no ritmo, na janela, esfriando, parado). A prioridade sobe quando o deal entra na janela e cai quando a chance de ainda fechar despenca.

## 4. Plano da semana com restrição de tempo

O vendedor não tem tempo infinito. Ele informa quantos deals consegue trabalhar a fundo nesta semana, e a ferramenta monta a pauta que **maximiza o valor esperado** nesse limite: um problema de alocação, não uma ordenação.

## 5. Alavancas acionáveis para o manager

O baseline mostra números. Aqui o manager recebe **sugestões**:

- deals em que outro vendedor do mesmo escritório tem taxa de vitória muito maior naquele produto ou setor (candidatos a apoio ou pareamento);
- vendedores com pipeline concentrado em deals parados (pauta de coaching);
- tudo com o número que justifica a sugestão.

## 6. Explicação como um "recibo"

Cada score é decomposto em fatores somáveis (log-odds convertidos em pontos), escritos em linguagem de vendedor e comparados com a média:

> **82** · base do pipeline 63% · **+9** GTX Pro fecha 71% em contas de Tecnologia · **+6** você ganha 74% neste produto · **−4** 48 dias em Engaging (ganhos fecham em ~40) · **= janela de fechamento: ligar esta semana**

## 7. Qualidade de dados como feature do produto

Inconsistências encontradas no CRM (nomes divergentes, deals sem conta, datas faltando) são tratadas no pipeline de dados **e mostradas** na interface e nos docs. Uma ferramenta de produção não esconde dado sujo; ela avisa.

## 8. O que deliberadamente NÃO fizemos

- **Sem LLM gerando a explicação de cada deal.** O texto é determinístico e auditável; um LLM poderia inventar motivo. Saber onde não usar IA também é critério.
- **Sem modelo de caixa-preta.** Um gradient boosting talvez ganhasse alguns pontos de AUC, mas perderia a explicação, que é o que faz o vendedor confiar.
- **Sem banco nem login.** Não agregam nada à decisão neste escopo; ficam na seção de escala.

## 9. Interface com identidade

Direção visual própria, escolhida por mim entre propostas geradas com as skills de design (processo em [DESIGN.md](./DESIGN.md)), com um único elemento memorável e todo o resto disciplinado. Pronta para produção: acessível, responsiva, modo escuro de verdade.

---

**Status:** itens 1, 2, 3 e 6 são o núcleo e não saem do escopo. Itens 4 e 5 seguem a regra de corte de [PLAN.md](./PLAN.md).
