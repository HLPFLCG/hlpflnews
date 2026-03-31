const ET_TZ = 'America/New_York';

function getETTime(): { hour: number; minute: number; day: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TZ,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now);

  let hour = 0, minute = 0, day = 0;
  for (const p of parts) {
    if (p.type === 'hour') hour = parseInt(p.value);
    if (p.type === 'minute') minute = parseInt(p.value);
    if (p.type === 'weekday') {
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      day = dayMap[p.value] ?? 0;
    }
  }
  return { hour, minute, day };
}

export function getSession(symbol: string): 'RTH' | 'ETH' | 'CLOSED' {
  const { hour, minute, day } = getETTime();
  const timeMin = hour * 60 + minute;

  // Saturday always closed
  if (day === 6) return 'CLOSED';

  // Daily break: 17:00-18:00 ET
  if (timeMin >= 1020 && timeMin < 1080) return 'CLOSED';

  // Sunday: only open after 18:00 ET
  if (day === 0) {
    return timeMin >= 1080 ? 'ETH' : 'CLOSED';
  }

  // Friday: close at 17:00 ET
  if (day === 5 && timeMin >= 1020) return 'CLOSED';

  // Check RTH windows
  const isEquity = symbol === 'ES=F' || symbol === 'NQ=F';
  const isMetals = symbol === 'GC=F' || symbol === 'SI=F';

  if (isEquity && timeMin >= 570 && timeMin < 975) return 'RTH'; // 09:30-16:15
  if (isMetals && timeMin >= 560 && timeMin < 870) return 'RTH'; // 09:20-14:30

  // If not RTH but within Globex hours (Sun 18:00 - Fri 17:00 with daily break)
  return 'ETH';
}

export function formatETTime(date?: Date): string {
  const d = date ?? new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

export function getETDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getSessionLabel(symbol: string): string {
  const isEquity = symbol === 'ES=F' || symbol === 'NQ=F';
  if (isEquity) return 'ES/NQ RTH: 09:30–16:15 ET';
  return 'GC/SI RTH: 09:20–14:30 ET';
}
