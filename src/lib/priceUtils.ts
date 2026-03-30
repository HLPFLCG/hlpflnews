export function formatPrice(price: number, symbol: string): string {
  if (symbol === 'GC=F') return price.toFixed(2);
  if (symbol === 'SI=F') return price.toFixed(3);
  if (symbol === 'ES=F' || symbol === 'NQ=F') return price.toFixed(2);
  return price.toFixed(2);
}

export function calcChange(current: number, prevClose: number): { change: number; changePct: number } {
  const change = current - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  return { change, changePct };
}

export function formatChange(change: number, symbol: string): string {
  const sign = change >= 0 ? '+' : '';
  if (symbol === 'SI=F') return `${sign}${change.toFixed(3)}`;
  return `${sign}${change.toFixed(2)}`;
}

export function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function isDelayed(updatedAt: number): boolean {
  return Date.now() - updatedAt > 900000; // 15 min
}
