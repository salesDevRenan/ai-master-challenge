import Link from "next/link";
import { Suspense } from "react";
import { DealCard } from "@/components/deal-card";
import { asOptions, SelectField } from "@/components/select-field";
import { count, pct, usd } from "@/lib/format";
import { applyFilters, filterQuery, history, options, parseFilters, pipeline, summarize } from "@/lib/pipeline";

const FOCUS_SIZES = [5, 10, 20] as const;

export default function TodayPage(props: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="field">Carregando o pipeline…</p>}>
      <Today searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Today({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const { agent } = parseFilters(params);
  const requested = Number(params.foco);
  const size = FOCUS_SIZES.find((n) => n === requested) ?? 10;

  const mine = applyFilters(pipeline, { agent });
  const { active, stalled, activeExpectedValue, stalledValueShare } = summarize(mine);
  const focus = active.slice(0, size);

  return (
    <>
      <form method="get" className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <SelectField name="vendedor" label="Vendedor" value={agent} options={asOptions(options.agents)} allLabel="Todos os vendedores" />
        <label className="flex flex-col gap-1">
          <span className="field">Deals na pauta</span>
          <select name="foco" defaultValue={String(size)} className="control cursor-pointer">
            {FOCUS_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="field min-h-11 cursor-pointer text-primary underline underline-offset-4">
          Ver pauta
        </button>
      </form>

      <h1 className="mt-[6vh] text-[clamp(34px,4.4vw,68px)] leading-none font-semibold tracking-[-0.03em]">Onde focar hoje</h1>
      <p className="mt-3 max-w-[60ch] text-[17px] text-secondary">
        {agent ?? "Todos os vendedores"} · {count(active.length)} deals ativos · valor esperado de {usd(activeExpectedValue)}. Ordenados por
        valor esperado (chance × preço). A posição de cada deal acompanha os dias em que está aberto.
      </p>

      <div className="mt-[5vh] hidden justify-between min-[720px]:flex" aria-hidden="true">
        <span className="field">0 dias</span>
        <span className="field">{history.maxCycle} dias · maior ciclo já fechado</span>
      </div>

      {focus.length === 0 ? (
        <p className="mt-6 text-[17px]">Nenhum deal ativo para este filtro.</p>
      ) : (
        <ol className="mt-2" aria-label="Deals priorizados">
          {focus.map((scored, i) => (
            <DealCard key={scored.deal.id} scored={scored} rank={i + 1} />
          ))}
        </ol>
      )}

      {active.length > focus.length && (
        <p className="mt-6">
          <Link href={`/pipeline${filterQuery({ agent })}`} className="link text-[17px]">
            Ver todos os {count(active.length)} deals ativos
          </Link>
        </p>
      )}

      {stalled.length > 0 && (
        <section aria-labelledby="parados" className="mt-[10vh] text-left min-[720px]:text-right">
          <h2 id="parados" className="text-[clamp(22px,2.2vw,36px)] font-semibold tracking-[-0.02em] text-stalled">
            {count(stalled.length)} deals parados há mais de {history.maxCycle}&nbsp;dias
          </h2>
          <p className="field mt-2 text-stalled">{pct(stalledValueShare)} do valor do pipeline aberto</p>
          <p className="mt-3 text-[16px] text-secondary min-[720px]:ml-auto min-[720px]:max-w-[46ch]">
            Nenhum dos {count(history.closedDeals)} deals já fechados levou mais que {history.maxCycle} dias. Revise ou desqualifique
            esses deals para liberar tempo e limpar a previsão.
          </p>
          <p className="mt-3">
            <Link href={`/pipeline${filterQuery({ agent, momentum: "stalled" })}`} className="link text-[17px] text-stalled">
              Revisar a fila de parados
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
