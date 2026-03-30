'use client';

import { useState, useEffect } from 'react';
import { EconEvent } from '@/types/trading';

interface Props {
  events: EconEvent[];
}

export default function AlertBar({ events }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const imminent = events.find(
    (e) => e.isHighImpact && e.minsUntil >= -5 && e.minsUntil <= 15
  );

  if (!imminent) {
    return <div style={{ height: 0, overflow: 'hidden' }} />;
  }

  const minsUntil = (imminent.time - now) / 60000;
  const isUrgent = minsUntil > 0 && minsUntil < 3;
  const isPast = minsUntil < 0;

  let timeText: string;
  if (isPast) {
    const minsAgo = Math.abs(Math.round(minsUntil));
    timeText = `${imminent.name} RELEASED ${minsAgo}m ago — WATCH FOR REACTION`;
  } else {
    const totalSec = Math.max(0, Math.round(minsUntil * 60));
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    timeText = `${imminent.name} IN ${mm}:${ss.toString().padStart(2, '0')}  —  VOLATILITY RISK`;
  }

  return (
    <div
      className="flex items-center justify-center px-4 transition-all duration-300"
      style={{
        height: '36px',
        background: 'linear-gradient(90deg, #c87941 0%, #e8973d 100%)',
        overflow: 'hidden',
      }}
    >
      <span
        className={`font-display text-[14px] tracking-[0.12em] uppercase ${isUrgent ? 'animate-blink-warn' : ''}`}
        style={{ color: 'var(--void)' }}
      >
        ⚠ {timeText}
      </span>
    </div>
  );
}
