'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AlertBar from '@/components/trading/AlertBar';
import PriceTicker from '@/components/trading/PriceTicker';
import FilterBar from '@/components/trading/FilterBar';
import StatusBar from '@/components/trading/StatusBar';
import MarketFlash from '@/components/trading/MarketFlash';
import EconomicCalendar from '@/components/trading/EconomicCalendar';
import RssColumns from '@/components/trading/RssColumns';
import SettingsPanel from '@/components/trading/SettingsPanel';
import { usePrices } from '@/hooks/usePrices';
import { useFinnhub } from '@/hooks/useFinnhub';
import { useEconomicCalendar } from '@/hooks/useEconomicCalendar';
import { useRssFeeds } from '@/hooks/useRssFeeds';
import { loadStorage, saveStorage } from '@/lib/storage';
import { FEED_DEFS } from '@/lib/feedDefs';
import { StorageSchema, FeedDef } from '@/types/trading';

export default function TradingPage() {
  const { tiles, flashing, lastFetch, refreshPrices } = usePrices();
  const [storage, setStorage] = useState<StorageSchema>(() => loadStorage());
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { newsItems: flashItems, lastFetch: lastFlashFetch } = useFinnhub(
    storage.keys.finnhub,
    storage.intervals.flashSeconds,
    storage.alerts.sound,
    storage.alerts.tiers,
  );
  const { events } = useEconomicCalendar(storage.keys.finnhub);

  // Build active feed list from defaults + storage overrides
  const feeds: FeedDef[] = FEED_DEFS.map((def) => {
    const override = storage.feeds.find((f) => f.id === def.id);
    return override ? { ...def, on: override.on } : def;
  });

  const { feedResults, lastFetch: lastRssFetch, loading: rssLoading } = useRssFeeds(
    feeds,
    storage.keys.rss2json,
    storage.intervals.rssMinutes,
  );
  const [debugMode, setDebugMode] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStorage(loadStorage());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          if (!e.ctrlKey && !e.metaKey) setRightPanelOpen((p) => !p);
          break;
        case 'c':
          document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'r':
          refreshPrices();
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) setSettingsOpen((p) => !p);
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setDebugMode((p) => !p);
          }
          break;
        case 'escape':
          setSettingsOpen(false);
          break;
        case '1':
        case '2':
        case '3':
        case '4': {
          const idx = parseInt(e.key) - 1;
          const tileEls = document.querySelectorAll('[data-price-tile]');
          tileEls[idx]?.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [refreshPrices]);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    const updated = { ...storage, filter };
    setStorage(updated);
    saveStorage(updated);
  }, [storage]);

  const handleUpdateStorage = useCallback((partial: Partial<StorageSchema>) => {
    const updated = { ...storage, ...partial } as StorageSchema;
    // Deep merge for nested objects
    if (partial.keys) updated.keys = { ...storage.keys, ...partial.keys };
    if (partial.layout) updated.layout = { ...storage.layout, ...partial.layout };
    if (partial.intervals) updated.intervals = { ...storage.intervals, ...partial.intervals };
    if (partial.account) updated.account = { ...storage.account, ...partial.account };
    if (partial.alerts) updated.alerts = { ...storage.alerts, ...partial.alerts };
    setStorage(updated);
    saveStorage(updated);
  }, [storage]);

  const feedCount = feeds.filter((f) => f.on).length;
  const totalItems = Object.values(feedResults).reduce((sum, r) => sum + (r.items?.length || 0), 0);

  return (
    <div
      className="w-full"
      style={{
        height: '100vh',
        background: 'var(--void)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto auto auto 1fr auto',
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

      {/* Row 3: Filter Bar (hidden in focus mode) */}
      {!focusMode && (
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Row 4: Main area */}
      <div
        ref={mainRef}
        style={{
          display: 'grid',
          gridTemplateColumns: rightPanelOpen ? '1fr 295px' : '1fr',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left: RSS columns */}
        {!focusMode && (
          <RssColumns
            feeds={feeds}
            feedResults={feedResults}
            loading={rssLoading}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            view={storage.layout.view}
          />
        )}

        {/* Right: Flash + Calendar panel */}
        {rightPanelOpen && (
          <div
            style={{
              borderLeft: '0.5px solid var(--gold-muted)',
              background: 'var(--void-2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Market Flash */}
            <MarketFlash
              items={flashItems}
              onOpenSettings={() => setSettingsOpen(true)}
              finnhubKey={storage.keys.finnhub}
            />

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--void-4)' }} />

            {/* Economic Calendar */}
            <div id="calendar-section">
              <EconomicCalendar
                events={events}
                finnhubKey={storage.keys.finnhub}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Right panel toggle */}
        {!focusMode && (
          <button
            onClick={() => setRightPanelOpen((p) => !p)}
            className="fixed z-40 font-display text-[10px] tracking-[0.12em]"
            style={{
              right: rightPanelOpen ? '295px' : '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--void-3)',
              border: '1px solid var(--gold-muted)',
              borderRight: rightPanelOpen ? 'none' : undefined,
              borderLeft: rightPanelOpen ? undefined : 'none',
              color: 'var(--gold)',
              padding: '8px 3px',
              cursor: 'pointer',
              borderRadius: rightPanelOpen ? '4px 0 0 4px' : '0 4px 4px 0',
              transition: 'right 0.3s ease',
            }}
          >
            {rightPanelOpen ? '◀' : '▶'}
          </button>
        )}
      </div>

      {/* Row 5: Status Bar (hidden in focus mode) */}
      {!focusMode && (
        <StatusBar
          lastPriceFetch={lastFetch}
          lastFlashFetch={lastFlashFetch}
          lastRssFetch={lastRssFetch}
          feedCount={feedCount}
          itemCount={totalItems + flashItems.length}
          priceIntervalSec={storage.intervals.priceSeconds}
          flashIntervalSec={storage.intervals.flashSeconds}
          rssIntervalMin={storage.intervals.rssMinutes}
        />
      )}

      {/* Focus Mode Button */}
      <button
        onClick={() => setFocusMode((p) => !p)}
        className="fixed top-2 right-2 z-50 font-display text-[11px] tracking-[0.12em] px-2 py-1"
        style={{
          background: focusMode ? 'var(--gold)' : 'var(--void-3)',
          color: focusMode ? 'var(--void)' : 'var(--gold)',
          border: '1px solid var(--gold-muted)',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        FOCUS
      </button>

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        storage={storage}
        onUpdate={handleUpdateStorage}
        feeds={feeds}
      />

      {/* Debug Console */}
      {debugMode && (
        <div
          className="fixed bottom-7 left-0 right-0 z-50 p-3 font-mono text-[10px] overflow-y-auto"
          style={{
            height: '200px',
            background: 'rgba(10,10,10,0.95)',
            borderTop: '1px solid var(--gold)',
            color: 'var(--cream-3)',
          }}
        >
          <div style={{ color: 'var(--gold)' }}>DEBUG CONSOLE (Ctrl+D to toggle)</div>
          <div>Tiles: {tiles.map((t) => `${t.label}=${t.price}`).join(' | ')}</div>
          <div>Last price fetch: {lastFetch > 0 ? new Date(lastFetch).toISOString() : 'never'}</div>
          <div>Filter: {activeFilter} | Search: &quot;{searchQuery}&quot;</div>
          <div>Right panel: {rightPanelOpen ? 'open' : 'closed'} | Focus: {focusMode ? 'on' : 'off'}</div>
          <div>Storage: setup_done={String(storage.setup_done)} finnhub={storage.keys.finnhub ? 'set' : 'unset'}</div>
        </div>
      )}
    </div>
  );
}
