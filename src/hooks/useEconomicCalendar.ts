'use client';

import { useState, useEffect, useCallback } from 'react';
import { EconEvent } from '@/types/trading';
import { classifyHeadline } from '@/lib/keywordTiers';
import { finnhubLimiter } from '@/lib/rateLimiter';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useEconomicCalendar(apiKey: string) {
  const [events, setEvents] = useState<EconEvent[]>([]);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchCalendar = useCallback(async () => {
    if (!apiKey) return;

    try {
      await finnhubLimiter.acquire();
      const today = todayStr();
      const resp = await fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${today}&token=${apiKey}`
      );
      if (!resp.ok) return;

      const data = await resp.json();
      const raw = data?.economicCalendar || [];

      const now = Date.now();
      const parsed: EconEvent[] = raw.map((item: any, idx: number) => {
        const eventTime = new Date(item.time || item.date).getTime();
        const minsUntil = (eventTime - now) / 60000;
        const impact = item.impact === 3 ? 'high' : item.impact === 2 ? 'medium' : 'low';
        const isHighImpact = impact === 'high' || classifyHeadline(item.event || '') >= 1;

        return {
          id: `econ-${idx}-${item.event}`,
          time: eventTime,
          name: item.event || 'Unknown Event',
          impact,
          prev: item.prev != null ? String(item.prev) : '—',
          forecast: item.estimate != null ? String(item.estimate) : '—',
          actual: item.actual != null ? String(item.actual) : '—',
          country: item.country || 'US',
          isHighImpact,
          minsUntil,
        };
      });

      // Sort by time
      parsed.sort((a, b) => a.time - b.time);
      setEvents(parsed);
      setLastFetch(Date.now());
    } catch { /* network error */ }
  }, [apiKey]);

  // Update minsUntil every 10s
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setEvents((prev) =>
        prev.map((e) => ({ ...e, minsUntil: (e.time - now) / 60000 }))
      );
    }, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchCalendar();
    const id = setInterval(fetchCalendar, 300000); // 5 min
    return () => clearInterval(id);
  }, [fetchCalendar]);

  return { events, lastFetch };
}
