export const TIER1: string[] = [
  'FOMC', 'rate decision', 'rate hike', 'rate cut', 'emergency meeting',
  'circuit breaker', 'trading halt', 'market closed', 'flash crash',
  'nuclear', 'attack', 'explosion', 'assassination', 'coup', 'invasion',
  'war declared', 'sanctions', 'Iran', 'Israel strikes', 'Russia attack',
  'OPEC emergency', 'bank failure', 'contagion', 'bank run', 'default',
];

export const TIER2: string[] = [
  'CPI', 'PPI', 'NFP', 'GDP', 'PCE', 'jobless claims', 'Fed speak',
  'Powell', 'inflation', 'recession', 'gold price', 'silver price',
  'interest rate', 'Treasury yield', 'dollar index', 'DXY',
  'oil price', 'crude', 'OPEC', 'G7', 'G20', 'IMF', 'World Bank',
  'trade war', 'tariff', 'debt ceiling', 'budget', 'shutdown',
  'federal reserve', 'basis points', 'yield curve', 'spread',
];

export const TIER3: string[] = [
  'earnings', 'GDP revision', 'consumer confidence', 'retail sales',
  'housing', 'PMI', 'ISM', 'manufacturing', 'unemployment rate',
  'capacity utilization', 'durable goods', 'trade balance',
];

export function classifyHeadline(headline: string): 0 | 1 | 2 | 3 {
  const lower = headline.toLowerCase();
  for (const kw of TIER1) {
    if (lower.includes(kw.toLowerCase())) return 1;
  }
  for (const kw of TIER2) {
    if (lower.includes(kw.toLowerCase())) return 2;
  }
  for (const kw of TIER3) {
    if (lower.includes(kw.toLowerCase())) return 3;
  }
  return 0;
}
