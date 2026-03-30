'use client';

import { useState, useEffect, useMemo } from 'react';
import { NewsItem, FeedDef } from '@/types/trading';
import { formatAge } from '@/lib/priceUtils';

interface FeedResult {
  feedId: string;
  items: NewsItem[];
  error?: string;
}

interface Props {
  feeds: FeedDef[];
  feedResults: Record<string, FeedResult>;
  loading: boolean;
  searchQuery: string;
  activeFilter: string;
  view: 'columns' | 'stream';
}

function TierBadge({ tier }: { tier: 0 | 1 | 2 | 3 }) {
  if (tier === 0) return null;
  const styles: Record<number, { bg: string; color: string; label: string }> = {
    1: { bg: 'rgba(231,76,60,0.2)', color: '#e74c3c', label: '⚡T1' },
    2: { bg: 'rgba(243,156,18,0.2)', color: '#f39c12', label: '⚠T2' },
    3: { bg: 'rgba(241,196,15,0.2)', color: '#f1c40f', label: '◆T3' },
  };
  const s = styles[tier];
  return (
    <span className="px-1 py-0.5 font-mono text-[8px]" style={{ background: s.bg, color: s.color, borderRadius: '2px' }}>
      {s.label}
    </span>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ background: 'var(--gold-muted)', color: 'var(--gold)', borderRadius: '1px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function NewsItemRow({ item, searchQuery }: { item: NewsItem; searchQuery: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const age = now - item.pubTime;
  const ageColor = age < 3600000 ? '#2ecc71' : 'var(--cream-3)';
  const hasTier = item.tier === 1 || item.tier === 2;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-2.5 py-[7px] transition-colors group"
      style={{
        borderBottom: '0.5px solid var(--void-4)',
        borderLeft: hasTier ? `2px solid ${item.tier === 1 ? '#e74c3c' : '#f39c12'}` : undefined,
      }}
    >
      <div className="font-body text-[11px] leading-[1.5] group-hover:text-[var(--gold)]" style={{ color: 'var(--cream)' }}>
        <HighlightedText text={item.headline} query={searchQuery} />
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="font-mono text-[9px]" style={{ color: ageColor }}>
          {formatAge(age)}
        </span>
        <TierBadge tier={item.tier} />
      </div>
    </a>
  );
}

function FeedColumn({ feed, result, loading, searchQuery }: { feed: FeedDef; result?: FeedResult; loading: boolean; searchQuery: string }) {
  const items = useMemo(() => {
    if (!result?.items) return [];
    if (!searchQuery) return result.items;
    return result.items.filter((i) => i.headline.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [result, searchQuery]);

  const hasTierItems = items.some((i) => i.tier === 1 || i.tier === 2);

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{ width: '240px', height: '100%', background: 'var(--void)' }}
    >
      {/* Column header */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 flex-shrink-0"
        style={{
          height: '32px',
          background: 'var(--void-3)',
          borderBottom: '0.5px solid var(--gold-muted)',
        }}
      >
        <span className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: feed.color }} />
        <span className="font-display text-[10px] tracking-[0.12em] uppercase truncate" style={{ color: feed.color }}>
          {feed.name}
        </span>
        <span className="font-mono text-[8px] px-1 py-0.5 flex-shrink-0" style={{ background: 'var(--void-4)', color: 'var(--cream-3)', borderRadius: '2px' }}>
          {items.length}
        </span>
        {hasTierItems && (
          <span className="text-[9px]" style={{ color: '#e74c3c' }}>⚡</span>
        )}
      </div>

      {/* Column body */}
      <div className="flex-1 overflow-y-auto">
        {loading && !result && (
          <div className="p-3 font-display text-[11px]" style={{ color: 'var(--cream-3)' }}>
            LOADING<span className="animate-pulse-live">...</span>
          </div>
        )}
        {result?.error && (
          <div className="p-3">
            <div className="font-body text-[10px]" style={{ color: '#e74c3c' }}>⚠ SOURCE ERROR</div>
            <div className="font-body text-[9px] mt-1" style={{ color: 'var(--cream-3)' }}>{result.error}</div>
          </div>
        )}
        {!loading && items.length === 0 && !result?.error && (
          <div className="p-3 font-body text-[11px]" style={{ color: 'var(--cream-3)' }}>NO RESULTS</div>
        )}
        {items.map((item) => (
          <NewsItemRow key={item.id} item={item} searchQuery={searchQuery} />
        ))}
      </div>
    </div>
  );
}

function StreamView({ feeds, feedResults, searchQuery }: { feeds: FeedDef[]; feedResults: Record<string, FeedResult>; searchQuery: string }) {
  const allItems = useMemo(() => {
    const items: (NewsItem & { feedColor: string })[] = [];
    for (const feed of feeds) {
      if (!feed.on) continue;
      const result = feedResults[feed.id];
      if (!result?.items) continue;
      for (const item of result.items) {
        if (searchQuery && !item.headline.toLowerCase().includes(searchQuery.toLowerCase())) continue;
        items.push({ ...item, feedColor: feed.color });
      }
    }
    items.sort((a, b) => b.pubTime - a.pubTime);
    return items;
  }, [feeds, feedResults, searchQuery]);

  return (
    <div className="overflow-y-auto p-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '6px', alignContent: 'start' }}>
      {allItems.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2.5 transition-colors hover:bg-[var(--void-3)]"
          style={{
            background: 'var(--void-2)',
            borderRadius: '4px',
            borderLeft: `3px solid ${item.feedColor}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-display text-[9px] tracking-[0.08em] uppercase" style={{ color: item.feedColor }}>
              {item.source}
            </span>
            <TierBadge tier={item.tier} />
          </div>
          <div className="font-body text-[11px] leading-[1.5]" style={{ color: 'var(--cream)' }}>
            <HighlightedText text={item.headline} query={searchQuery} />
          </div>
          <div className="font-mono text-[9px] mt-1" style={{ color: 'var(--cream-3)' }}>
            {formatAge(Date.now() - item.pubTime)}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function RssColumns({ feeds, feedResults, loading, searchQuery, activeFilter, view }: Props) {
  const filteredFeeds = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'flash' || activeFilter === 'calendar') {
      return feeds.filter((f) => f.on);
    }
    return feeds.filter((f) => f.on && f.cat === activeFilter);
  }, [feeds, activeFilter]);

  if (view === 'stream') {
    return <StreamView feeds={filteredFeeds} feedResults={feedResults} searchQuery={searchQuery} />;
  }

  return (
    <div
      className="flex gap-[6px] p-2"
      style={{ overflowX: 'auto', overflowY: 'hidden', height: '100%' }}
    >
      {filteredFeeds.map((feed) => (
        <FeedColumn
          key={feed.id}
          feed={feed}
          result={feedResults[feed.id]}
          loading={loading}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
