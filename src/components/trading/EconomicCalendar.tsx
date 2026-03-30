'use client';

import { useState, useEffect } from 'react';
import { EconEvent } from '@/types/trading';

interface Props {
  events: EconEvent[];
  finnhubKey: string;
  onOpenSettings: () => void;
}

function ImpactDot({ impact, isHighImpact }: { impact: string; isHighImpact: boolean }) {
  const color = impact === 'high' ? '#e74c3c' : impact === 'medium' ? '#f39c12' : '#6a6a6a';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{
        background: color,
        boxShadow: isHighImpact ? `0 0 6px ${color}` : undefined,
      }}
    />
  );
}

function CountdownText({ minsUntil }: { minsUntil: number }) {
  if (minsUntil <= 0 && minsUntil > -5) {
    const ago = Math.abs(Math.round(minsUntil));
    return <span className="font-mono text-[9px] font-semibold" style={{ color: '#e74c3c' }}>{ago === 0 ? 'LIVE' : `${ago}m ago`}</span>;
  }
  if (minsUntil <= -5) {
    return <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>{Math.abs(Math.round(minsUntil))}m ago</span>;
  }
  if (minsUntil <= 15) {
    return <span className="font-mono text-[9px] animate-pulse-live" style={{ color: '#e74c3c' }}>in {Math.round(minsUntil)}m</span>;
  }
  if (minsUntil <= 60) {
    return <span className="font-mono text-[9px]" style={{ color: '#f39c12' }}>in {Math.round(minsUntil)}m</span>;
  }
  const h = Math.floor(minsUntil / 60);
  const m = Math.round(minsUntil % 60);
  return <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>in {h}h {m}m</span>;
}

function formatEventTime(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(timestamp));
  } catch {
    return '--:--';
  }
}

export default function EconomicCalendar({ events, finnhubKey, onOpenSettings }: Props) {
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  if (!finnhubKey) {
    return (
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <div className="font-display text-[13px] tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
          TODAY&apos;S EVENTS
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="font-body text-[12px]" style={{ color: 'var(--cream-3)' }}>
            Set your Finnhub API key to enable the economic calendar.
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
      <div className="px-3 py-2">
        <span className="font-display text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
          TODAY&apos;S EVENTS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {events.length === 0 && (
          <div className="p-3 text-center font-body text-[11px]" style={{ color: 'var(--cream-3)' }}>
            No scheduled releases today
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="px-3 py-2"
            style={{ borderBottom: '0.5px solid var(--void-4)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--cream-3)' }}>
                  {formatEventTime(event.time)}
                </span>
                <ImpactDot impact={event.impact} isHighImpact={event.isHighImpact} />
                <span
                  className="font-body text-[11px] truncate"
                  style={{
                    color: event.isHighImpact ? 'var(--cream)' : 'var(--cream-2)',
                    fontWeight: event.isHighImpact ? 500 : 400,
                  }}
                >
                  {event.name}
                </span>
              </div>
              <CountdownText minsUntil={event.minsUntil} />
            </div>
            <div className="flex items-center gap-3 mt-0.5 ml-[52px]">
              <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>PREV: {event.prev}</span>
              <span className="font-mono text-[9px]" style={{ color: 'var(--cream-3)' }}>FCST: {event.forecast}</span>
              <span className="font-mono text-[9px]" style={{ color: event.actual !== '��' ? 'var(--cream)' : 'var(--cream-3)' }}>
                ACT: {event.actual}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Topstep/Apex reminder */}
      <div className="px-3 py-2" style={{ borderTop: '0.5px solid var(--void-4)' }}>
        <p className="font-body text-[9px] italic" style={{ color: 'var(--cream-3)', lineHeight: 1.5 }}>
          Topstep/Apex session rules shown are approximate and may change.
          Verify current rules with your prop firm directly.
        </p>
      </div>
    </div>
  );
}
