'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '@/types/trading';
import { classifyHeadline } from '@/lib/keywordTiers';
import { finnhubLimiter } from '@/lib/rateLimiter';

const SEEN_KEY = 'hlpfl_seen_ids';
const MAX_SEEN = 200;

function getSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveSeenIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  const arr = Array.from(ids).slice(-MAX_SEEN);
  sessionStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

function isDuplicate(headline: string, existing: NewsItem[]): boolean {
  const words = new Set(headline.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (words.size === 0) return false;
  for (const item of existing.slice(0, 50)) {
    const otherWords = new Set(item.headline.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    if (otherWords.size === 0) continue;
    let overlap = 0;
    for (const w of words) {
      if (otherWords.has(w)) overlap++;
    }
    const ratio = overlap / Math.min(words.size, otherWords.size);
    if (ratio > 0.8) return true;
  }
  return false;
}

function playTier1Alert() {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    const tones = [880, 1200, 880];
    const durations = [0.08, 0.06, 0.08];
    let t = ctx.currentTime;

    for (let i = 0; i < tones.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(tones[i], t);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + durations[i]);
      t += durations[i] + 0.02;
    }

    gain.gain.linearRampToValueAtTime(0, t);
    setTimeout(() => ctx.close(), 1000);
  } catch { /* audio not available */ }
}

export function useFinnhub(apiKey: string, intervalSec: number, soundEnabled: boolean, alertTiers: number[]) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [lastFetch, setLastFetch] = useState(0);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(50);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectDelay = useRef(2000);

  const addItems = useCallback((rawItems: Array<{ id: number; headline: string; source: string; datetime: number; url: string; category: string }>) => {
    const seenIds = getSeenIds();

    setNewsItems((prev) => {
      const newItems: NewsItem[] = [];

      for (const raw of rawItems) {
        const id = String(raw.id);
        if (seenIds.has(id)) continue;
        if (isDuplicate(raw.headline, prev)) continue;

        seenIds.add(id);
        const tier = classifyHeadline(raw.headline);
        const isNew = Date.now() - raw.datetime * 1000 < 120000;

        const item: NewsItem = {
          id,
          headline: raw.headline,
          source: raw.source,
          pubTime: raw.datetime * 1000,
          url: raw.url,
          category: raw.category,
          tier,
          isNew,
        };

        if (tier === 1 && soundEnabled && alertTiers.includes(1) && Date.now() - item.pubTime < 60000) {
          playTier1Alert();
        }

        newItems.push(item);
      }

      saveSeenIds(seenIds);
      if (newItems.length === 0) return prev;
      return [...newItems, ...prev].slice(0, 500);
    });
  }, [soundEnabled, alertTiers]);

  // REST polling
  useEffect(() => {
    if (!apiKey) return;

    async function pollNews() {
      try {
        const endpoints = [
          `/api/v1/news?category=general`,
          `/api/v1/news?category=forex`,
        ];

        for (const ep of endpoints) {
          await finnhubLimiter.acquire();
          const resp = await fetch(`https://finnhub.io${ep}&token=${apiKey}`);
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) addItems(data);
          }
        }

        const symbols = ['GLD', 'SPY', 'QQQ'];
        for (const sym of symbols) {
          await finnhubLimiter.acquire();
          const resp = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${todayStr()}&to=${todayStr()}&token=${apiKey}`);
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) addItems(data);
          }
        }

        setLastFetch(Date.now());
        setRateLimitRemaining(finnhubLimiter.remaining);
      } catch { /* network error */ }
    }

    pollNews();
    const id = setInterval(pollNews, intervalSec * 1000);
    return () => clearInterval(id);
  }, [apiKey, intervalSec, addItems]);

  // WebSocket
  useEffect(() => {
    if (!apiKey) return;

    function connect() {
      try {
        const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectDelay.current = 2000;
          ws.send(JSON.stringify({ type: 'subscribe', symbol: 'news' }));
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === 'news' && Array.isArray(data.data)) {
              addItems(data.data);
            }
          } catch { /* parse error */ }
        };

        ws.onclose = () => {
          reconnectTimeout.current = setTimeout(() => {
            reconnectDelay.current = Math.min(reconnectDelay.current * 2, 60000);
            connect();
          }, reconnectDelay.current);
        };

        ws.onerror = () => ws.close();
      } catch { /* ws not available */ }
    }

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [apiKey, addItems]);

  return { newsItems, lastFetch, rateLimitRemaining };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
