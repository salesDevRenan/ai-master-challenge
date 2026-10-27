import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MomentumLabel } from "@/components/momentum";
import { asOptions, SelectField } from "@/components/select-field";
import { count, pct, usd } from "@/lib/format";
import { applyFilters, filterQuery, MOMENTUM_ORDER, options, parseFilters, pipeline, summarize } from "@/lib/pipeline";
import { MOMENTUM_LABEL } from "@/lib/scoring/score";

export const metadata: Metadata = { title: "Pipeline" };

const PAGE = 50;

export default function PipelinePage(props: PageProps<"/pipeline">) {
  return (
    <Suspense fallback={<p className="field">Carregando o pipeline…</p>}>
      <Pipeline searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Pipeline({ searchParams }: { searchParams: PageProps<"/pipeline">["searchParams"] }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const limit = Math.max(PAGE, Math.min(Number(params.limite) || PAGE, 5000));

  const rows = applyFilters(pipeline, filters);
  const { active, stalled, activeExpectedValue, withoutAccount } = summarize(rows);
  const shown = rows.slice(0, limit);

  return (
    <>
      <h1 className="text-[clamp(34px,4.4vw,68px)] leading-none font-semibold tracking-[-0.03em]">Pipeline</h1>
      <p className="mt-3 max-w-[70ch] text-[17px] text-secondary">
        {count(rows.length)} deals abertos · {count(active.length)} ativos com valor esperado de {usd(activeExpectedValue)} ·{" "}
        <span className="text-stalled">{count(stalled.length)} parados</span> · {count(withoutAccount)} sem conta cadastrada.
      </p>

      <form method="get" className="mt-[4vh] flex flex-wrap items-end gap-x-8 gap-y-4">
        <SelectField name="vendedor" label="Vendedor" value={filters.agent} options={asOptions(options.agents)} allLabel="Todos" />
        <SelectField name="manager" label="Manager" value={filters.manager} options={asOptions(options.managers)} allLabel="Todos" />
        <SelectField name="escritorio" label="Escritório" value={filters.office} options={asOptions(options.offices)} allLabel="Todos" />
        <SelectField name="produto" label="Produto" value={filters.product} options={asOptions(options.products)} allLabel="Todos" />
        <SelectField
          name="momento"
          label="Momento"
          value={filters.momentum}
          options={MOMENTUM_ORDER.map((m) => ({ value: m, label: MOMENTUM_LABEL[m] }))}
          allLabel="Todos"
        />
        <div className="flex gap-6">
          <button type="submit" className="field min-h-11 cursor-pointer text-primary underline underline-offset-4">
            Filtrar
          </button>
          <Link href="/pipeline" className="field inline-flex min-h-11 items-center hover:text-primary">
            Limpar
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 text-[17px]">Nenhum deal com esses filtros.</p>
      ) : (
        <table className="mt-[5vh] w-full border-collapse text-left text-[16px]">
          <caption className="sr-only">Deals abertos ordenados por valor esperado</caption>
          <thead className="hidden min-[900px]:table-header-group">
            <tr>
              {["Score", "Deal", "Produto", "Vendedor", "Momento", "Chance", "Valor esperado"].map((h, i) => (
                <th key={h} scope="col" className={`field pb-3 font-normal ${i >= 5 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.deal.id} className="block py-4 min-[900px]:table-row min-[900px]:py-0">
                <Cell label="Score" className="tabular-nums">
                  {s.score ?? "—"}
                </Cell>
                <Cell label="Deal">
                  <Link href={`/deal/${s.deal.id}`} className="deal-id link text-primary">
                    {s.deal.id}
                  </Link>
                </Cell>
                <Cell label="Produto" className="font-semibold">
                  {s.deal.product}
                </Cell>
                <Cell label="Vendedor">{s.deal.agent}</Cell>
                <Cell label="Momento">
                  <MomentumLabel scored={s} />
                </Cell>
                <Cell label="Chance" className="tabular-nums min-[900px]:text-right">
                  {s.winProbability === null ? "—" : pct(s.winProbability)}
                </Cell>
                <Cell label="Valor esperado" className="tabular-nums min-[900px]:text-right">
                  {s.winProbability === null ? <span className="text-stalled">{usd(s.deal.listPrice)} parado</span> : usd(s.expectedValue)}
                </Cell>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rows.length > shown.length && (
        <p className="mt-8">
          <Link href={`/pipeline${filterQuery(filters, { limite: String(limit + PAGE) })}`} scroll={false} className="link text-[17px]">
            Mostrar mais {Math.min(PAGE, rows.length - shown.length)} de {count(rows.length - shown.length)} restantes
          </Link>
        </p>
      )}
    </>
  );
}

/** Célula que vira par campo/valor no celular (o rótulo vem do data-label). */
function Cell({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <td
      data-label={label}
      className={`flex items-baseline gap-4 py-0.5 before:field before:w-[9.5rem] before:shrink-0 before:content-[attr(data-label)] min-[900px]:table-cell min-[900px]:py-2.5 min-[900px]:pr-4 min-[900px]:before:hidden ${className}`}
    >
      {children}
    </td>
  );
}
