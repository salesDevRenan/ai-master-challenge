import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { asOptions, SelectField } from "@/components/select-field";
import { count, pct, usd } from "@/lib/format";
import { analysis, applyFilters, dataset, filterQuery, history, options, parseFilters, pipeline, summarize } from "@/lib/pipeline";

export const metadata: Metadata = { title: "Time" };

export default function TeamPage(props: PageProps<"/time">) {
  return (
    <Suspense fallback={<p className="field">Carregando o time…</p>}>
      <Team searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Team({ searchParams }: { searchParams: PageProps<"/time">["searchParams"] }) {
  const { manager } = parseFilters(await searchParams);
  const team = applyFilters(pipeline, { manager });
  const totals = summarize(team);
  const agents = dataset.agents
    .filter((a) => !manager || a.manager === manager)
    .map((a) => ({ agent: a, ...summarize(team.filter((s) => s.deal.agent === a.name)) }))
    .filter((row) => row.active.length + row.stalled.length > 0)
    .sort((a, b) => a.agent.name.localeCompare(b.agent.name, "pt-BR"));

  return (
    <>
      <h1 className="text-[clamp(34px,4.4vw,68px)] leading-none font-semibold tracking-[-0.03em]">Time</h1>
      <p className="mt-3 max-w-[68ch] text-[17px] text-secondary">
        Higiene do pipeline por vendedor: onde há deals parados para revisar e contas para cadastrar. A lista está em ordem alfabética, sem
        ranking de desempenho, porque as diferenças de taxa de vitória entre vendedores são compatíveis com o acaso (
        <Link href="/metodologia" className="link">
          ver metodologia
        </Link>
        ).
      </p>

      <form method="get" className="mt-[4vh] flex flex-wrap items-end gap-x-8 gap-y-4">
        <SelectField name="manager" label="Manager" value={manager} options={asOptions(options.managers)} allLabel="Todos os managers" />
        <button type="submit" className="field min-h-11 cursor-pointer text-primary underline underline-offset-4">
          Ver time
        </button>
      </form>

      <dl className="mt-[5vh] grid grid-cols-1 gap-x-8 gap-y-6 min-[480px]:grid-cols-2 min-[900px]:grid-cols-4">
        <Stat label="Deals ativos" value={count(totals.active.length)} />
        <Stat label="Valor esperado ativo" value={usd(totals.activeExpectedValue)} />
        <Stat label="Deals parados" value={count(totals.stalled.length)} tone="stalled" />
        <Stat label="Valor do pipeline parado" value={pct(totals.stalledValueShare)} tone="stalled" />
      </dl>

      <table className="mt-[6vh] w-full border-collapse text-left text-[16px]">
        <caption className="sr-only">Pipeline por vendedor</caption>
        <thead className="hidden min-[900px]:table-header-group">
          <tr>
            {["Vendedor", "Escritório", "Ativos", "Valor esperado", "Parados", "Valor parado", "Sem conta"].map((h, i) => (
              <th key={h} scope="col" className={`field pb-3 font-normal ${i >= 2 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {agents.map(({ agent, active, stalled, activeExpectedValue, stalledValueShare, withoutAccount }) => (
            <tr key={agent.name} className="block py-4 min-[900px]:table-row min-[900px]:py-0">
              <Cell label="Vendedor" className="font-semibold">
                <Link href={`/${filterQuery({ agent: agent.name })}`} className="link">
                  {agent.name}
                </Link>
              </Cell>
              <Cell label="Escritório">{agent.regionalOffice}</Cell>
              <Cell label="Ativos" num>
                {count(active.length)}
              </Cell>
              <Cell label="Valor esperado" num>
                {usd(activeExpectedValue)}
              </Cell>
              <Cell label="Parados" num>
                <Link href={`/pipeline${filterQuery({ agent: agent.name, momentum: "stalled" })}`} className="link text-stalled">
                  {count(stalled.length)}
                </Link>
              </Cell>
              <Cell label="Valor parado" num className="text-stalled">
                {pct(stalledValueShare)}
              </Cell>
              <Cell label="Sem conta" num>
                {count(withoutAccount)}
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>

      <section aria-labelledby="trimestre" className="mt-[9vh] max-w-[62ch]">
        <h2 id="trimestre" className="field">
          Padrão para acompanhar
        </h2>
        <p className="mt-3 text-[clamp(20px,1.8vw,28px)] leading-snug font-medium tracking-[-0.01em]">
          Deals fechados no último mês do trimestre venceram {pct(analysis.quarter.quarterEnd.winRate)} das vezes; nos outros meses,{" "}
          {pct(analysis.quarter.otherMonths.winRate)}.
        </p>
        <p className="mt-3 text-[16px] text-secondary">
          Pode ser um padrão comercial real (vitórias puxadas para o fechamento do trimestre, perdas baixadas no início do seguinte) ou um
          artefato do dataset. Por isso não entra no score. Vale observar antes de desqualificar deals em janeiro e fevereiro. Base:{" "}
          {count(history.closedDeals)} deals fechados.
        </p>
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "stalled" }) {
  return (
    <div>
      <dt className={`field ${tone === "stalled" ? "text-stalled" : ""}`}>{label}</dt>
      <dd className={`mt-1 text-[clamp(26px,2.6vw,42px)] font-bold tracking-[-0.03em] tabular-nums ${tone === "stalled" ? "text-stalled" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function Cell({ label, num, className = "", children }: { label: string; num?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <td
      data-label={label}
      className={`flex items-baseline gap-4 py-0.5 before:field before:w-[9.5rem] before:shrink-0 before:content-[attr(data-label)] min-[900px]:table-cell min-[900px]:py-2.5 min-[900px]:pr-4 min-[900px]:before:hidden ${num ? "tabular-nums min-[900px]:text-right" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
