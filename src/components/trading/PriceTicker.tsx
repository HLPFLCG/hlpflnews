'use client';

import { useState } from 'react';
import { PriceTile } from '@/types/trading';
import { formatPrice, formatChange, formatPct, isDelayed } from '@/lib/priceUtils';
import { getSessionLabel } from '@/lib/sessionTimes';

interface Props {
  tiles: PriceTile[];
  flashing: Record<string, boolean>;
  accountTrailingDD?: number;
  accountDailyPnL?: number;
}

function SessionBadge({ session }: { session: 'RTH' | 'ETH' | 'CLOSED' }) {
  const styles: Record<string, { bg: string; color: string }> = {
    RTH: { bg: 'rgba(46,204,113,0.13)', color: '#2ecc71' },
    ETH: { bg: 'rgba(243,156,18,0.13)', color: '#f39c12' },
    CLOSED: { bg: 'rgba(255,255,255,0.07)', color: '#6a6a6a' },
  };
  const s = styles[session];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase" style={{ background: s.bg, color: s.color, borderRadius: '2px' }}>
      {session === 'RTH' && <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: '#2ecc71' }} />}
      {session}
    </span>
  );
}

function SourceBadge({ source, isStale, updatedAt }: { source: string; isStale: boolean; updatedAt: number }) {
  if (isStale) {
    return <span className="px-1 py-0.5 text-[9px] font-mono uppercase" style={{ background: 'rgba(243,156,18,0.2)', color: '#f39c12', borderRadius: '2px' }}>STALE</span>;
  }
  if (isDelayed(updatedAt)) {
    return <span className="px-1 py-0.5 text-[9px] font-mono uppercase" style={{ background: 'rgba(180,180,180,0.1)', color: '#6a6a6a', borderRadius: '2px' }}>15-MIN DELAY</span>;
  }
  const label = source === 'tradovate' ? 'TV LIVE' : source === 'proxy' ? 'PROXY' : 'YAHOO';
  const color = source === 'tradovate' ? '#2ecc71' : '#6a6a6a';
  return <span className="px-1 py-0.5 text-[9px] font-mono uppercase" style={{ background: 'rgba(180,180,180,0.1)', color, borderRadius: '2px' }}>{label}</span>;
}

function PriceTileCard({ tile, isFlashing, accountTrailingDD, accountDailyPnL }: {
  tile: PriceTile;
  isFlashing: boolean;
  accountTrailingDD?: number;
  accountDailyPnL?: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isPositive = tile.change >= 0;
  const changeColor = isPositive ? '#2ecc71' : '#e74c3c';
  const priceOpacity = tile.isStale ? 0.5 : 1;

  // Drawdown proximity warning
  let ddWarning: string | null = null;
  if (accountTrailingDD && accountDailyPnL !== undefined) {
    const warnThreshold = accountTrailingDD * 0.8;
    const absPnL = Math.abs(accountDailyPnL);
    if (absPnL >= warnThreshold) {
      const remaining = accountTrailingDD - absPnL;
      ddWarning = `EST. DD PROXIMITY: $${Math.max(0, remaining).toFixed(0)} away`;
    }
  }

  return (
    <div
      className="relative flex-1 flex flex-col justify-center px-3 py-1.5 transition-colors"
      style={{
        borderRight: '0.5px solid var(--gold-muted)',
        borderColor: isFlashing ? 'var(--gold)' : 'var(--gold-muted)',
        transition: 'border-color 0.3s ease',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
          {tile.label}
        </span>
        <SessionBadge session={tile.session} />
      </div>

      {/* Price */}
      <div className="font-mono text-[22px] font-medium leading-tight" style={{ color: 'var(--cream)', opacity: priceOpacity }}>
        {tile.price > 0 ? formatPrice(tile.price, tile.symbol) : '—'}
      </div>

      {/* Change row */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px]" style={{ color: changeColor }}>
          {isPositive ? '▲' : '▼'} {formatChange(tile.change, tile.symbol)}
        </span>
        <span className="font-mono text-[11px]" style={{ color: changeColor }}>
          {formatPct(tile.changePct)}
        </span>
        <SourceBadge source={tile.source} isStale={tile.isStale} updatedAt={tile.updatedAt} />
      </div>

      {/* DD Warning */}
      {ddWarning && (
        <div className="mt-0.5 px-1 py-0.5 text-[9px] font-mono" style={{ background: 'rgba(243,156,18,0.15)', color: '#f39c12', borderRadius: '2px' }}>
          {ddWarning}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full left-0 z-50 p-3 mt-1 animate-fade-in"
          style={{
            background: 'var(--void-3)',
            border: '1px solid var(--gold)',
            borderRadius: '4px',
            minWidth: '240px',
          }}
        >
          <div className="font-display text-[14px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
            {tile.label} CONTRACT INFO
          </div>
          <div className="mt-2 space-y-1 font-body text-[12px]" style={{ color: 'var(--cream-2)' }}>
            <div>Tick value: ${tile.tickValue.toFixed(tile.symbol === 'SI=F' ? 3 : 2)} per tick</div>
            <div>Point value: ${tile.pointValue.toFixed(2)} per full point</div>
            <div>{tile.contractInfo}</div>
            <div>{getSessionLabel(tile.symbol)}</div>
          </div>
          <div className="mt-2 font-body text-[10px] italic" style={{ color: 'var(--cream-3)' }}>
            DISCLAIMER: Uses unofficial Yahoo Finance endpoint. Data may be delayed.
            {tile.symbol === 'GC=F' || tile.symbol === 'SI=F'
              ? ` ${tile.label} = front-month futures, NOT spot price.`
              : ' FUTURES price. Not spot. Unofficial data.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PriceTicker({ tiles, flashing, accountTrailingDD, accountDailyPnL }: Props) {
  return (
    <div
      className="flex w-full"
      style={{
        height: '64px',
        background: 'var(--void-2)',
        borderBottom: '1px solid var(--gold-muted)',
      }}
    >
      {tiles.map((tile) => (
        <PriceTileCard
          key={tile.symbol}
          tile={tile}
          isFlashing={flashing[tile.symbol] || false}
          accountTrailingDD={accountTrailingDD}
          accountDailyPnL={accountDailyPnL}
        />
      ))}
    </div>
  );
}
