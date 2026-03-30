'use client';

import { useState, useEffect, useCallback } from 'react';
import AlertBar from '@/components/trading/AlertBar';
import PriceTicker from '@/components/trading/PriceTicker';
import { usePrices } from '@/hooks/usePrices';
import { loadStorage } from '@/lib/storage';
import { EconEvent } from '@/types/trading';

export default function TradingPage() {
  const { tiles, flashing, lastFetch, refreshPrices } = usePrices();
  const [events, setEvents] = useState<EconEvent[]>([]);
  const [storage, setStorage] = useState(() => loadStorage());

  // Reload storage on mount (client-side)
  useEffect(() => {
    setStorage(loadStorage());
  }, []);

  return (
    <div
      className="flex flex-col w-full"
      style={{
        height: '100vh',
        background: 'var(--void)',
        overflow: 'hidden',
      }}
    >
      {/* Row 1: Alert Bar */}
      <AlertBar events={events} />

      {/* Row 2: Price Ticker */}
      <PriceTicker
        tiles={tiles}
        flashing={flashing}
        accountTrailingDD={storage.account.trailingDD}
        accountDailyPnL={0}
      />

      {/* Placeholder for remaining rows - will be filled in subsequent phases */}
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--cream-3)' }}>
        <div className="text-center">
          <div className="font-display text-[28px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
            HLPFL INTEL FEED
          </div>
          <div className="font-body text-[13px] mt-2" style={{ color: 'var(--cream-2)' }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    </div>
  );
}
