'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceTile, InstrumentDef } from '@/types/trading';
import { calcChange } from '@/lib/priceUtils';
import { getSession } from '@/lib/sessionTimes';
import { loadStorage } from '@/lib/storage';

const INSTRUMENTS: InstrumentDef[] = [
  { symbol: 'GC=F', label: 'GOLD', tickValue: 0.10, pointValue: 10, contractInfo: '100 troy oz · $0.10/tick = $10' },
  { symbol: 'SI=F', label: 'SILVER', tickValue: 0.005, pointValue: 50, contractInfo: '5,000 oz · $0.005/tick = $25' },
  { symbol: 'ES=F', label: 'ES', tickValue: 0.25, pointValue: 50, contractInfo: '$50/pt · $12.50/tick' },
  { symbol: 'NQ=F', label: 'NQ', tickValue: 0.25, pointValue: 20, contractInfo: '$20/pt · $5.00/tick' },
];

async function fetchYahooDirect(symbol: string): Promise<{ price: number; prevClose: number; time: number } | null> {
  try {
    const resp = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
      time: (meta.regularMarketTime ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}

async function fetchYahooProxy(symbol: string): Promise<{ price: number; prevClose: number; time: number } | null> {
  try {
    const url = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
    const resp = await fetch(`https://api.allorigins.win/raw?url=${url}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
      time: (meta.regularMarketTime ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}

async function fetchCorsProxy(symbol: string): Promise<{ price: number; prevClose: number; time: number } | null> {
  try {
    const url = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
    const resp = await fetch(`https://corsproxy.io/?url=${url}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
      time: (meta.regularMarketTime ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}

async function fetchPrice(symbol: string): Promise<{ price: number; prevClose: number; time: number; source: 'yahoo' | 'proxy' } | null> {
  const direct = await fetchYahooDirect(symbol);
  if (direct) return { ...direct, source: 'yahoo' };

  const proxy1 = await fetchYahooProxy(symbol);
  if (proxy1) return { ...proxy1, source: 'proxy' };

  const proxy2 = await fetchCorsProxy(symbol);
  if (proxy2) return { ...proxy2, source: 'proxy' };

  return null;
}

export function usePrices() {
  const [tiles, setTiles] = useState<PriceTile[]>(() =>
    INSTRUMENTS.map((inst) => ({
      ...inst,
      price: 0,
      prevClose: 0,
      change: 0,
      changePct: 0,
      updatedAt: 0,
      source: 'yahoo' as const,
      isStale: true,
      session: 'CLOSED' as const,
    }))
  );
  const [lastFetch, setLastFetch] = useState(0);
  const [flashing, setFlashing] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchAll = useCallback(async () => {
    for (let i = 0; i < INSTRUMENTS.length; i++) {
      const inst = INSTRUMENTS[i];
      if (i > 0) await new Promise((r) => setTimeout(r, 500));

      const result = await fetchPrice(inst.symbol);
      if (!result) continue;

      const { change, changePct } = calcChange(result.price, result.prevClose);
      const session = getSession(inst.symbol);
      const isStale = Date.now() - result.time > 90000;

      setTiles((prev) =>
        prev.map((t) =>
          t.symbol === inst.symbol
            ? { ...t, price: result.price, prevClose: result.prevClose, change, changePct, updatedAt: Date.now(), source: result.source, isStale, session }
            : t
        )
      );

      setFlashing((prev) => ({ ...prev, [inst.symbol]: true }));
      setTimeout(() => setFlashing((prev) => ({ ...prev, [inst.symbol]: false })), 300);
    }
    setLastFetch(Date.now());
  }, []);

  const updateTileFromTradovate = useCallback((symbol: string, price: number) => {
    setTiles((prev) =>
      prev.map((t) => {
        if (t.symbol !== symbol) return t;
        const { change, changePct } = calcChange(price, t.prevClose || price);
        return { ...t, price, change, changePct, updatedAt: Date.now(), source: 'tradovate' as const, isStale: false, session: getSession(symbol) };
      })
    );
    setFlashing((prev) => ({ ...prev, [symbol]: true }));
    setTimeout(() => setFlashing((prev) => ({ ...prev, [symbol]: false })), 300);
  }, []);

  useEffect(() => {
    fetchAll();
    const storage = loadStorage();
    const intervalMs = (storage.intervals.priceSeconds || 5) * 1000;

    intervalRef.current = setInterval(fetchAll, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  // Update sessions every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setTiles((prev) =>
        prev.map((t) => ({ ...t, session: getSession(t.symbol) }))
      );
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return { tiles, lastFetch, flashing, refreshPrices: fetchAll, updateTileFromTradovate };
}

export { INSTRUMENTS };
