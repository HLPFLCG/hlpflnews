'use client';

import { AccountState } from '@/types/trading';

interface Props {
  state: 'disconnected' | 'authenticating' | 'connected' | 'error' | 'reconnecting';
  accountState: AccountState;
  error: string;
}

function Meter({ label, pct, remaining }: { label: string; pct: number; remaining: number }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  const color = clampedPct >= 90 ? '#e74c3c' : clampedPct >= 80 ? '#e67e22' : clampedPct >= 60 ? '#f39c12' : '#2ecc71';
  const isPulsing = clampedPct >= 90;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-display text-[9px] tracking-[0.08em] uppercase" style={{ color: 'var(--cream-3)' }}>
          {label}
        </span>
        <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>
          {Math.round(clampedPct)}%
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{ height: '4px', background: 'var(--void-4)', borderRadius: '2px' }}
      >
        <div
          className={isPulsing ? 'animate-blink-warn' : ''}
          style={{
            width: `${clampedPct}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--cream-3)' }}>
        ${Math.max(0, remaining).toFixed(0)} remaining
      </div>
    </div>
  );
}

export default function TradovatePanel({ state, accountState, error }: Props) {
  if (state === 'disconnected') return null;

  return (
    <div className="p-3" style={{ borderTop: '1px solid var(--void-4)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
          TRADOVATE
        </span>
        {state === 'connected' && (
          <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71', borderRadius: '2px' }}>
            CONNECTED
          </span>
        )}
        {state === 'authenticating' && (
          <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ background: 'rgba(243,156,18,0.15)', color: '#f39c12', borderRadius: '2px' }}>
            CONNECTING...
          </span>
        )}
        {state === 'error' && (
          <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ background: 'rgba(231,76,60,0.15)', color: '#e74c3c', borderRadius: '2px' }}>
            ERROR
          </span>
        )}
        {state === 'reconnecting' && (
          <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase animate-pulse-live" style={{ background: 'rgba(243,156,18,0.15)', color: '#f39c12', borderRadius: '2px' }}>
            RECONNECTING
          </span>
        )}
        <span className="px-1.5 py-0.5 font-mono text-[8px] uppercase" style={{ background: 'rgba(243,156,18,0.15)', color: '#f39c12', borderRadius: '2px' }}>
          DEMO
        </span>
      </div>

      {error && (
        <div className="font-mono text-[9px] mb-2" style={{ color: '#e74c3c' }}>
          {error}
        </div>
      )}

      {state === 'connected' && (
        <>
          {/* Daily P&L */}
          <div className="mb-3">
            <div
              className="font-mono text-[18px] font-medium"
              style={{ color: accountState.dailyPnL >= 0 ? '#2ecc71' : '#e74c3c' }}
            >
              {accountState.dailyPnL >= 0 ? '▲' : '▼'} ${Math.abs(accountState.dailyPnL).toFixed(2)}
            </div>
            <div className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>
              DAILY P&L
            </div>
          </div>

          {/* Meters */}
          <Meter label="PDLL" pct={accountState.pdllPct} remaining={accountState.pdllDistance} />
          <Meter label="TRLDD" pct={accountState.ddPct} remaining={accountState.ddDistance} />

          {/* Disclaimer */}
          <p className="font-body text-[9px] italic mt-3" style={{ color: 'var(--cream-3)', lineHeight: 1.5 }}>
            P&L shown is approximate from Tradovate demo data.
            Topstep computes account limits independently.
            Always verify at topstep.com before any risk decision.
          </p>
        </>
      )}
    </div>
  );
}
