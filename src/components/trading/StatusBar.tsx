'use client';

import { useState, useEffect } from 'react';
import { formatETTime } from '@/lib/sessionTimes';
import { getSession } from '@/lib/sessionTimes';

interface Props {
  lastPriceFetch: number;
  lastFlashFetch: number;
  lastRssFetch: number;
  feedCount: number;
  itemCount: number;
  priceIntervalSec: number;
  flashIntervalSec: number;
  rssIntervalMin: number;
}

export default function StatusBar({
  lastPriceFetch,
  lastFlashFetch,
  lastRssFetch,
  feedCount,
  itemCount,
  priceIntervalSec,
  flashIntervalSec,
  rssIntervalMin,
}: Props) {
  const [now, setNow] = useState(Date.now());
  const [etTime, setEtTime] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      setEtTime(formatETTime());
    }, 1000);
    setEtTime(formatETTime());
    return () => clearInterval(id);
  }, []);

  const priceAgo = lastPriceFetch > 0 ? Math.round((now - lastPriceFetch) / 1000) : -1;
  const flashAgo = lastFlashFetch > 0 ? Math.round((now - lastFlashFetch) / 1000) : -1;
  const rssAgo = lastRssFetch > 0 ? Math.round((now - lastRssFetch) / 60000) : -1;

  const priceStale = priceAgo > priceIntervalSec * 2;
  const flashStale = flashAgo > flashIntervalSec * 2;
  const rssStale = rssAgo > rssIntervalMin * 2;

  const esSession = getSession('ES=F');
  const gcSession = getSession('GC=F');

  // Next refresh countdown
  const nextPriceRefresh = lastPriceFetch > 0 ? Math.max(0, priceIntervalSec - priceAgo) : 0;
  const mins = Math.floor(nextPriceRefresh / 60);
  const secs = nextPriceRefresh % 60;

  return (
    <div
      className="flex items-center justify-between px-3 font-mono text-[10px]"
      style={{
        height: '28px',
        background: 'var(--void-2)',
        borderTop: '0.5px solid var(--gold-muted)',
        color: 'var(--cream-3)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: '#2ecc71' }} />
          LIVE
        </span>
        <span>{etTime} ET</span>
        <span>ES/NQ: {esSession}</span>
        <span>GC/SI: {gcSession}</span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-3">
        <span style={{ color: priceStale ? '#f39c12' : undefined }}>
          {priceStale ? '⚠ STALE' : priceAgo >= 0 ? `prices ${priceAgo}s ago` : 'prices —'}
        </span>
        <span style={{ color: flashStale ? '#f39c12' : undefined }}>
          {flashStale ? '⚠ STALE' : flashAgo >= 0 ? `flash ${flashAgo}s ago` : 'flash —'}
        </span>
        <span style={{ color: rssStale ? '#f39c12' : undefined }}>
          {rssStale ? '⚠ STALE' : rssAgo >= 0 ? `RSS ${rssAgo}m ago` : 'RSS —'}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span>{feedCount} feeds</span>
        <span>{itemCount} items</span>
        <span>next refresh {mins}:{secs.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}
