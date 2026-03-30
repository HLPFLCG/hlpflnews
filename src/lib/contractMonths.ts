const QUARTERLY_MONTHS = [
  { month: 3, code: 'H' },
  { month: 6, code: 'M' },
  { month: 9, code: 'U' },
  { month: 12, code: 'Z' },
];

function getThirdFriday(year: number, month: number): Date {
  const d = new Date(year, month - 1, 1);
  const dayOfWeek = d.getDay();
  const firstFriday = dayOfWeek <= 5 ? (5 - dayOfWeek + 1) : (5 + 7 - dayOfWeek + 1);
  return new Date(year, month - 1, firstFriday + 14);
}

export function getFrontMonth(symbol: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const yearSuffix = year % 10;

  const isEquity = symbol === 'ES=F' || symbol === 'NQ=F';
  const prefix = symbol === 'ES=F' ? 'ES' : symbol === 'NQ=F' ? 'NQ' : symbol === 'GC=F' ? 'GC' : 'SI';

  if (isEquity) {
    for (const q of QUARTERLY_MONTHS) {
      const thirdFri = getThirdFriday(year, q.month);
      const rollDate = new Date(thirdFri);
      rollDate.setDate(rollDate.getDate() - 2);

      if (month < q.month || (month === q.month && day <= rollDate.getDate())) {
        return `${prefix}${q.code}${yearSuffix}`;
      }
    }
    return `${prefix}H${(yearSuffix + 1) % 10}`;
  }

  // Metals: monthly, roll ~25th of previous month
  let targetMonth = month;
  if (day > 25) targetMonth = month + 1;
  if (targetMonth > 12) targetMonth = 1;

  const monthCodes = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
  const mYear = targetMonth < month ? yearSuffix + 1 : yearSuffix;
  return `${prefix}${monthCodes[targetMonth - 1]}${mYear % 10}`;
}
