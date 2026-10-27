import type { Metadata } from "next";
import { count, pct, usd } from "@/lib/format";
import { analysis, dataset, history } from "@/lib/pipeline";

export const metadata: Metadata = { title: "Metodologia" };

const FACTOR_NAME: Record<string, string> = {
  agent: "Vendedor",
  product: "Produto",
  sector: "Setor da conta",
  companySize: "Porte da conta",
};

const decimal = (x: number, digits = 3) =>
  x.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace("-", "−");

export default function MethodologyPage() {
  const { agentSignal } = analysis;
  return (
    <article className="max-w-[78ch]">
      <h1 className="text-[clamp(34px,4.4vw,68px)] leading-none font-semibold tracking-[-0.03em]">Metodologia</h1>
      <p className="mt-6 text-[clamp(20px,1.8vw,28px)] leading-snug font-medium tracking-[-0.01em]">
        Neste CRM, nenhum modelo, nem o feeling, consegue prever quais deals vão ser ganhos ou perdidos. O que dá para saber é quanto cada deal
        vale e quais estão mortos. A Régua prioriza por isso.
      </p>

      <Section id="score" title="Como o score é calculado">
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[17px]">
          <li>
            A chance parte da taxa geral de vitória ({pct(history.baseRate, 1)} em {count(history.closedDeals)} deals fechados).
          </li>
          <li>
            Ela é ajustada pelo tempo no pipeline: deals que passaram da fase em que as perdas acontecem (mediana de {history.lostMedianCycle}{" "}
            dias) fecham mais.
          </li>
          <li>
            Depois, por vendedor, produto, setor e porte, com pesos aprendidos por Bayes empírico. Cada fator só pesa na medida em que sua
            variação supera o ruído estatístico.
          </li>
          <li>Valor esperado = chance × preço de tabela. O score (0–100) é a posição desse valor entre os deals ativos.</li>
          <li>
            Deals abertos há mais de {history.maxCycle} dias, o maior ciclo já fechado, saem do ranking e vão para a fila de revisão.
          </li>
        </ol>
      </Section>

      <Section id="fatores" title="O que separa ganhos de perdas">
        <Table
          head={["Fator", "Taxa bruta", "Após descontar o ruído"]}
          rows={analysis.factorSpread.map((f) => [
            FACTOR_NAME[f.key],
            `${pct(f.rawMin, 1)} – ${pct(f.rawMax, 1)}`,
            `${pct(f.shrunkMin, 1)} – ${pct(f.shrunkMax, 1)}`,
          ])}
        />
        <p className="mt-4 text-[16px] text-secondary">
          Vendedor: qui-quadrado de {decimal(agentSignal.chi2, 1)} com {agentSignal.degreesOfFreedom} graus de liberdade, o esperado se todos
          tivessem a mesma taxa real. A correlação da taxa entre semestres é de {decimal(agentSignal.agentStability.correlation, 2)}; por
          produto, de {decimal(agentSignal.agentProductStability.correlation, 2)}. Por isso a Régua não mostra ranking de vendedores.
        </p>
      </Section>

      <Section id="tempo" title="Tempo no pipeline">
        <Table
          head={["Deal ainda aberto após", "Chance de ganhar"]}
          rows={analysis.survivalPoints.map((p) => [`${p.day} dias`, pct(p.winRate, 1)])}
        />
        <p className="mt-4 text-[16px] text-stalled">
          {pct(analysis.stalledShareOfEngaging)} dos deals em Engaging já passaram de {history.maxCycle} dias. Eles somam{" "}
          {pct(analysis.stalledValueShare)} do valor do pipeline aberto ({usd(analysis.openValue)}). Ordenando só por preço,{" "}
          {pct(analysis.stalledInTopByPrice)} do topo seriam esses deals.
        </p>
      </Section>

      <Section id="backtest" title="Backtest">
        <p className="mt-3 text-[17px]">
          A Régua foi simulada em datas passadas: aprendendo só com o que tinha fechado até o corte e avaliada nos deals abertos naquele dia,
          cujo resultado hoje é conhecido.
        </p>
        {analysis.backtests.map((b) => (
          <div key={b.cutoff} className="mt-6">
            <h3 className="field">
              Corte em {b.cutoff.split("-").reverse().join("/")} · {count(b.evaluated)} deals avaliados
            </h3>
            <Table
              head={["Estratégia", "AUC da chance", "Receita no top 20%"]}
              rows={b.strategies.map((s) => [s.name, s.auc === null ? "—" : decimal(s.auc), pct(s.top20Share, 1)])}
            />
          </div>
        ))}
        <p className="mt-4 text-[16px] text-secondary">
          AUC ≈ 0,5 equivale a uma moeda: a chance não separa ganhos de perdas. O valor esperado captura cerca de metade da receita no top 20%,
          contra cerca de 19% do acaso. A regra de parados não pôde ser validada no backtest, porque nos cortes nenhum deal tinha passado do
          ciclo máximo conhecido.
        </p>
      </Section>

      <Section id="qualidade" title="Qualidade dos dados">
        <ul className="mt-3 space-y-3 text-[17px]">
          {dataset.quality.map((q) => (
            <li key={q.code}>
              <span className="font-medium">{q.description}</span>{" "}
              <span className="font-mono text-[14px] tabular-nums text-secondary">[{count(q.affected)}]</span>
              <br />
              <span className="text-secondary">{q.treatment}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="limites" title="Limitações">
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[17px]">
          <li>Dataset sintético: os padrões (ou a falta deles) podem não refletir um CRM real.</li>
          <li>Sem dados de atividade (e-mails, reuniões), que costumam ser o sinal mais forte de fechamento.</li>
          <li>
            Deals abertos usam o preço de tabela; nos ganhos, o valor fechado fica entre {pct(analysis.closeToList.p10)} e{" "}
            {pct(analysis.closeToList.p90)} dele (p10–p90).
          </li>
        </ul>
      </Section>
    </article>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-[7vh]">
      <h2 id={id} className="text-[clamp(22px,2vw,32px)] font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[16px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={`field pb-2 font-normal ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={`py-1.5 ${i > 0 ? "text-right font-mono text-[14px] tabular-nums" : "pr-4"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
