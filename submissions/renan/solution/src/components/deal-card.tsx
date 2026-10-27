import Link from "next/link";
import type { CSSProperties } from "react";
import { pct, usd } from "@/lib/format";
import type { ScoredDeal } from "@/lib/scoring/score";
import { MomentumLabel, rulerDay } from "./momentum";

/** Um deal da lista "Hoje", posicionado na régua pelos dias abertos. */
export function DealCard({ scored, rank }: { scored: ScoredDeal; rank: number }) {
  const { deal } = scored;
  return (
    <li className="ruler" style={{ "--d": rulerDay(scored) } as CSSProperties}>
      <Link href={`/deal/${deal.id}`} className="group block max-w-[30rem] py-5">
        <p className="flex items-baseline gap-3">
          <span className="field tabular-nums">{String(rank).padStart(2, "0")}</span>
          <span className="deal-id text-sm">{deal.id}</span>
          {scored.score !== null && <span className="field ml-auto">Score {scored.score}</span>}
        </p>
        <p className="mt-1 text-[clamp(28px,3.4vw,52px)] leading-[0.95] font-bold tracking-[-0.04em] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
          {deal.product}
        </p>
        <dl className="mt-3 grid grid-cols-[max-content_1fr] items-baseline gap-x-6 gap-y-1 text-[17px]">
          <dt className="field">{deal.agent}</dt>
          <dd className="font-medium tabular-nums">Chance {pct(scored.winProbability ?? 0)}</dd>
          <dt className="field">Valor esperado</dt>
          <dd className="font-medium tabular-nums">{usd(scored.expectedValue)}</dd>
          <dt className="field">Momento</dt>
          <dd>
            <MomentumLabel scored={scored} />
          </dd>
        </dl>
        <p className="mt-2 max-w-[36ch] text-[16px] text-moment">{scored.nextAction}</p>
        {scored.flags.map((flag) => (
          <p key={flag} className="field mt-2">
            {flag}
          </p>
        ))}
      </Link>
    </li>
  );
}
