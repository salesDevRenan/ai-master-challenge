import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { MomentumLabel, rulerDay } from "@/components/momentum";
import { companySizeBand } from "@/lib/scoring/history";
import { count, pct, points, usd } from "@/lib/format";
import { findDeal, history, pipeline } from "@/lib/pipeline";
import type { ScoredDeal } from "@/lib/scoring/score";

/** Abaixo de meio ponto percentual, o fator é tratado como ruído na explicação. */
const NOISE_THRESHOLD = 0.5;
const activeCount = pipeline.filter((s) => s.winProbability !== null).length;

export default function DealPage(props: PageProps<"/deal/[id]">) {
  return (
    <Suspense fallback={<p className="field">Carregando o deal…</p>}>
      <Deal params={props.params} />
    </Suspense>
  );
}

async function Deal({ params }: { params: PageProps<"/deal/[id]">["params"] }) {
  const { id } = await params;
  const scored = findDeal(id);
  if (!scored) notFound();
  const { deal } = scored;

  return (
    <article>
      <p>
        <Link href="/" className="field link">
          ← Voltar para Hoje
        </Link>
      </p>

      <header className="ruler mt-[5vh]" style={{ "--d": rulerDay(scored) } as CSSProperties}>
        <p className="deal-id text-[clamp(18px,1.8vw,28px)]">{deal.id}</p>
        <h1 className="mt-1 text-[clamp(44px,7vw,120px)] leading-[0.9] font-bold tracking-[-0.045em]">{deal.product}</h1>
        <p className="mt-3 text-[clamp(18px,1.5vw,24px)]">
          <MomentumLabel scored={scored} />
        </p>
        <p className="mt-2 max-w-[40ch] text-[clamp(17px,1.4vw,22px)] text-moment">{scored.nextAction}</p>
      </header>

      <div className="mt-[7vh] grid gap-x-[6vw] gap-y-[6vh] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section aria-labelledby="ficha">
          <h2 id="ficha" className="field">
            Ficha
          </h2>
          <dl className="mt-4 grid grid-cols-[max-content_1fr] items-baseline gap-x-6 gap-y-3 text-[17px]">
            <dt className="field">Vendedor</dt>
            <dd>{deal.agent}</dd>
            <dt className="field">Manager</dt>
            <dd>{deal.manager}</dd>
            <dt className="field">Escritório</dt>
            <dd>{deal.regionalOffice}</dd>
            <dt className="field">Stage no CRM</dt>
            <dd>{deal.stage}</dd>
            <dt className="field">Conta</dt>
            <dd>
              {deal.account ?? <span className="text-stalled">Não informada no CRM: cadastre para o setor e o porte entrarem na análise</span>}
            </dd>
            {deal.account && (
              <>
                <dt className="field">Setor</dt>
                <dd className="capitalize">{deal.sector}</dd>
                <dt className="field">Porte</dt>
                <dd>{companySizeBand(deal.accountEmployees)}</dd>
              </>
            )}
            <dt className="field">Engajamento</dt>
            <dd className="tabular-nums">{deal.engageDate ? deal.engageDate.split("-").reverse().join("/") : "ainda não engajado"}</dd>
            <dt className="field">Preço de tabela</dt>
            <dd className="tabular-nums">{usd(deal.listPrice)}</dd>
          </dl>
        </section>

        <section aria-labelledby="recibo">
          <h2 id="recibo" className="field">
            Por que este score
          </h2>
          {scored.winProbability === null ? <StalledExplanation scored={scored} /> : <Receipt scored={scored} />}
        </section>
      </div>
    </article>
  );
}

function Receipt({ scored }: { scored: ScoredDeal }) {
  const relevant = scored.factors.filter((f) => Math.abs(f.points) >= NOISE_THRESHOLD);
  const noise = scored.factors.filter((f) => Math.abs(f.points) < NOISE_THRESHOLD);
  return (
    <div className="mt-4 font-mono text-[14px] leading-relaxed">
      <Line label="Taxa geral de vitória" value={pct(history.baseRate, 1)} note={`${count(history.closedDeals)} deals fechados`} />
      {relevant.map((f) => (
        <Line key={f.key} label={f.label} value={points(f.points)} note={f.detail} />
      ))}
      {noise.length > 0 && (
        <Line
          label={noise.map((f) => f.label.split(":")[0]).join(", ")}
          value={points(noise.reduce((s, f) => s + f.points, 0))}
          note="Diferenças dentro do ruído estatístico: não mudam a chance"
          muted
        />
      )}
      <Line label="= Chance de fechar" value={pct(scored.winProbability!, 1)} strong />
      <Line label="× Preço de tabela" value={usd(scored.deal.listPrice)} />
      <Line label="= Valor esperado" value={usd(scored.expectedValue)} strong />
      <p className="mt-6 font-sans text-[16px] text-secondary">
        Score {scored.score}: posição do valor esperado deste deal entre os {count(activeCount)} deals ativos do pipeline, de 0 (menor) a
        100 (maior).
      </p>
    </div>
  );
}

function Line({ label, value, note, strong, muted }: { label: string; value: string; note?: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`py-2 ${strong ? "mt-2" : ""} ${muted ? "text-secondary" : ""}`}>
      <p className="flex items-baseline justify-between gap-6">
        <span className={strong ? "font-semibold" : ""}>{label}</span>
        <span className={`tabular-nums whitespace-nowrap ${strong ? "text-[18px] font-semibold" : ""}`}>{value}</span>
      </p>
      {note && <p className="mt-0.5 font-sans text-[14px] text-secondary">{note}</p>}
    </div>
  );
}

function StalledExplanation({ scored }: { scored: ScoredDeal }) {
  return (
    <div className="mt-4 max-w-[52ch] text-[17px] leading-relaxed">
      <p className="text-stalled">
        Aberto há {scored.daysOpen} dias. Nenhum dos {count(history.closedDeals)} deals já fechados levou mais que {history.maxCycle} dias.
      </p>
      <p className="mt-3">
        Não há base histórica para estimar a chance deste deal, então ele fica fora do ranking de foco. O valor de tabela de{" "}
        {usd(scored.deal.listPrice)} provavelmente não é receita real.
      </p>
      <p className="mt-3 text-secondary">Ação: confirme com o cliente se ainda há projeto. Se não houver, desqualifique para limpar a previsão.</p>
    </div>
  );
}
