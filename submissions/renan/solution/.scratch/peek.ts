import { readFileSync } from "node:fs";
import { buildHistory } from "../src/lib/scoring/history";
import { rankPipeline } from "../src/lib/scoring/score";
const ds = JSON.parse(readFileSync("data/generated/dataset.json", "utf8"));
const h = buildHistory(ds.deals);
const r = rankPipeline(ds.deals, h, ds.referenceDate);
for (const s of [r[0], r.find(x => x.momentum === "closing" && x.deal.product === "GTX Pro")!, r.find(x=>x.momentum==="prospecting")!])
  console.log(s.deal.id, s.deal.product, s.deal.agent, s.momentum, s.daysOpen, s.score, (s.winProbability!*100).toFixed(1), Math.round(s.expectedValue), s.factors.map(f => `${f.label} ${f.points.toFixed(1)}`).join(" | "), s.flags);
