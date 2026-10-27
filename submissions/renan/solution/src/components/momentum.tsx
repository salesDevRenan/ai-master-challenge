import type { ScoredDeal } from "@/lib/scoring/score";
import { MOMENTUM_LABEL } from "@/lib/scoring/score";
import { history } from "@/lib/pipeline";

export function momentumColor(momentum: ScoredDeal["momentum"]) {
  if (momentum === "stalled") return "text-stalled";
  if (momentum === "prospecting") return "text-secondary";
  return "text-moment";
}

/** "Reta final · 95/138": o indicador textual da régua, legível em qualquer largura. */
export function MomentumLabel({ scored, className = "" }: { scored: ScoredDeal; className?: string }) {
  return (
    <span className={`${momentumColor(scored.momentum)} ${className}`}>
      <span className="font-semibold">{MOMENTUM_LABEL[scored.momentum]}</span>
      {scored.daysOpen !== null && (
        <span className="ml-2 font-mono text-[0.85em] tabular-nums" title={`${scored.daysOpen} dias abertos; maior ciclo já fechado: ${history.maxCycle} dias`}>
          {scored.daysOpen}/{history.maxCycle}
        </span>
      )}
    </span>
  );
}

/** Posição do deal na régua: dias abertos, limitados ao maior ciclo; prospecção fica no zero. */
export function rulerDay(scored: ScoredDeal) {
  return Math.min(scored.daysOpen ?? 0, history.maxCycle);
}
