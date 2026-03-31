'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/trading';
import { formatAge } from '@/lib/priceUtils';

interface Props {
  items: NewsItem[];
  onOpenSettings: () => void;
  finnhubKey: string;
}

function TierBadge({ tier }: { tier: 0 | 1 | 2 | 3 }) {
  if (tier === 0) return null;
  const styles: Record<number, { bg: string; color: string; label: string }> = {
    1: { bg: 'rgba(231,76,60,0.2)', color: '#e74c3c', label: '⚡ TIER 1' },
    2: { bg: 'rgba(243,156,18,0.2)', color: '#f39c12', label: '⚠ TIER 2' },
    3: { bg: 'rgba(241,196,15,0.2)', color: '#f1c40f', label: '◆ TIER 3' },
  };
  const s = styles[tier];
  return (
    <span className="px-1 py-0.5 font-mono text-[8px] uppercase" style={{ background: s.bg, color: s.color, borderRadius: '2px' }}>
      {s.label}
    </span>
  );
}

export default function MarketFlash({ items, onOpenSettings, finnhubKey }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  if (!finnhubKey) {
    return (
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <div className="font-display text-[13px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
          MARKET FLASH
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="font-body text-[12px]" style={{ color: 'var(--cream-3)' }}>
            Set your Finnhub API key to enable live market news and alerts.
          </div>
          <a
            href="https://finnhub.io/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] underline"
            style={{ color: 'var(--gold)' }}
          >
            Get free Finnhub key ↗
          </a>
          <button
            onClick={onOpenSettings}
            className="font-display text-[10px] tracking-[0.12em] px-3 py-1.5"
            style={{
              background: 'var(--gold-muted)',
              border: '1px solid var(--gold)',
              color: 'var(--gold)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            SET KEY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
            MARKET FLASH
          </span>
          <span
            className="font-body text-[9px] cursor-help"
            style={{ color: 'var(--cream-3)' }}
            title="Finnhub free tier ~60s latency. Sub-30s requires Benzinga Pro."
          >
            ℹ
          </span>
        </div>
        <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>
          {items.length} items
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && (
          <div className="p-3 text-center font-body text-[11px]" style={{ color: 'var(--cream-3)' }}>
            Waiting for news...
          </div>
        )}
        {items.map((item) => {
          const age = now - item.pubTime;
          const ageColor = age < 300000 ? 'var(--gold)' : age < 1800000 ? '#2ecc71' : 'var(--void-4)';
          const borderColor = item.tier === 1 ? '#e74c3c' : item.tier === 2 ? '#f39c12' : ageColor;
          const isTier1 = item.tier === 1;
          const isRecent = age < 120000;

          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 transition-colors hover:bg-[var(--void-3)]"
              style={{
                borderLeft: `3px solid ${borderColor}`,
                borderBottom: '0.5px solid var(--void-4)',
                boxShadow: isTier1 ? '0 0 12px rgba(200,121,65,0.3)' : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-display text-[9px] tracking-[0.08em] uppercase" style={{ color: borderColor }}>
                  {item.source}
                </span>
                <TierBadge tier={item.tier} />
                {isRecent && item.isNew && (
                  <span className="font-mono text-[8px]" style={{ color: 'var(--gold)' }}>★ NEW</span>
                )}
              </div>
              <div className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--cream)' }}>
                {item.headline}
              </div>
              <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--cream-3)' }}>
                {formatAge(age)}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
