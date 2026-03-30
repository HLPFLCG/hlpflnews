'use client';

import { useState } from 'react';
import { StorageSchema, FeedDef } from '@/types/trading';
import { clearStorage } from '@/lib/storage';

interface Props {
  open: boolean;
  onClose: () => void;
  storage: StorageSchema;
  onUpdate: (partial: Partial<StorageSchema>) => void;
  feeds: FeedDef[];
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0"
      style={{
        width: '28px',
        height: '14px',
        borderRadius: '7px',
        background: value ? 'var(--gold)' : 'var(--void-4)',
        transition: 'background 0.2s',
        cursor: 'pointer',
        border: 'none',
      }}
    >
      <span
        className="absolute top-[2px] rounded-full"
        style={{
          width: '10px',
          height: '10px',
          background: 'white',
          left: value ? '16px' : '2px',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

function SegmentControl<T extends string | number>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-0.5">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className="px-2 py-1 font-mono text-[10px]"
          style={{
            background: value === opt.value ? 'var(--gold-muted)' : 'transparent',
            border: `1px solid ${value === opt.value ? 'var(--gold)' : 'var(--void-4)'}`,
            color: value === opt.value ? 'var(--gold)' : 'var(--cream-3)',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[9px] tracking-[0.12em] uppercase mb-2 mt-4" style={{ color: 'var(--gold-dim)' }}>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="mb-2">
      <label className="font-display text-[9px] tracking-[0.08em] uppercase block mb-1" style={{ color: 'var(--gold-dim)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 font-mono text-[10px]"
        style={{
          background: 'var(--void-4)',
          border: '0.5px solid var(--gold-muted)',
          borderRadius: '2px',
          color: 'var(--cream)',
          outline: 'none',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--gold-muted)')}
      />
    </div>
  );
}

export default function SettingsPanel({ open, onClose, storage, onUpdate, feeds }: Props) {
  const [testResult, setTestResult] = useState<Record<string, 'ok' | 'fail' | ''>>({});
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const testFinnhub = async () => {
    try {
      const resp = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${storage.keys.finnhub}`);
      setTestResult((p) => ({ ...p, finnhub: resp.ok ? 'ok' : 'fail' }));
    } catch {
      setTestResult((p) => ({ ...p, finnhub: 'fail' }));
    }
  };

  const updateKey = (key: keyof StorageSchema['keys'], value: string) => {
    onUpdate({ keys: { ...storage.keys, [key]: value } });
  };

  const toggleFeed = (feedId: string, on: boolean) => {
    const current = storage.feeds.filter((f) => f.id !== feedId);
    onUpdate({ feeds: [...current, { id: feedId, on }] });
  };

  const feedsByCategory = feeds.reduce<Record<string, FeedDef[]>>((acc, f) => {
    (acc[f.cat] = acc[f.cat] || []).push(f);
    return acc;
  }, {});

  // Get effective feed state
  const getFeedOn = (feedId: string) => {
    const override = storage.feeds.find((f) => f.id === feedId);
    if (override) return override.on;
    return feeds.find((f) => f.id === feedId)?.on ?? false;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[299]" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[300] overflow-y-auto animate-slide-in"
        style={{
          width: '320px',
          background: 'var(--void-3)',
          borderLeft: '1px solid var(--gold-muted)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--void-4)' }}>
          <span className="font-display text-[16px] tracking-[0.12em]" style={{ color: 'var(--gold)' }}>SETTINGS</span>
          <button onClick={onClose} className="font-body text-[16px]" style={{ color: 'var(--cream-3)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
        </div>

        <div className="p-4">
          {/* API KEYS */}
          <SectionLabel>API KEYS</SectionLabel>
          <InputField label="rss2json.com API Key" value={storage.keys.rss2json} onChange={(v) => updateKey('rss2json', v)} placeholder="Paste key..." />
          <a href="https://rss2json.com" target="_blank" rel="noopener noreferrer" className="font-body text-[10px] mb-3 inline-block" style={{ color: 'var(--gold)' }}>Get free key ↗</a>

          <InputField label="Finnhub API Key" value={storage.keys.finnhub} onChange={(v) => updateKey('finnhub', v)} placeholder="Paste key..." />
          <div className="flex items-center gap-2 mb-3">
            <a href="https://finnhub.io/dashboard" target="_blank" rel="noopener noreferrer" className="font-body text-[10px]" style={{ color: 'var(--gold)' }}>Get free key ↗</a>
            <button onClick={testFinnhub} className="font-mono text-[9px] px-2 py-0.5" style={{ border: '1px solid var(--gold-muted)', color: 'var(--gold)', borderRadius: '2px', cursor: 'pointer', background: 'none' }}>Test</button>
            {testResult.finnhub === 'ok' && <span className="font-mono text-[10px]" style={{ color: '#2ecc71' }}>✓</span>}
            {testResult.finnhub === 'fail' && <span className="font-mono text-[10px]" style={{ color: '#e74c3c' }}>✗</span>}
          </div>

          <InputField label="Tradovate Username" value={storage.keys.tradovate_user} onChange={(v) => updateKey('tradovate_user', v)} />
          <InputField label="Tradovate Password" value={storage.keys.tradovate_pass} onChange={(v) => updateKey('tradovate_pass', v)} type="password" />
          <InputField label="Tradovate Client ID" value={storage.keys.tradovate_cid} onChange={(v) => updateKey('tradovate_cid', v)} />
          <InputField label="Tradovate Device ID" value={storage.keys.tradovate_did} onChange={(v) => updateKey('tradovate_did', v)} />
          <InputField label="Tradovate Secret" value={storage.keys.tradovate_secret} onChange={(v) => updateKey('tradovate_secret', v)} type="password" />
          <InputField label="Tradovate Account ID" value={storage.keys.tradovate_account_id} onChange={(v) => updateKey('tradovate_account_id', v)} />
          <p className="font-body text-[9px] italic mb-4" style={{ color: 'var(--cream-3)' }}>
            Tradovate credentials stored locally. Never transmitted to third parties.
          </p>

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* PRICE SETTINGS */}
          <SectionLabel>PRICE SETTINGS</SectionLabel>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Refresh interval</span>
            <SegmentControl
              options={[{ label: '5s', value: 5 }, { label: '10s', value: 10 }, { label: '30s', value: 30 }, { label: '1min', value: 60 }]}
              value={storage.intervals.priceSeconds}
              onChange={(v) => onUpdate({ intervals: { ...storage.intervals, priceSeconds: v as any } })}
            />
          </div>

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* NEWS SETTINGS */}
          <SectionLabel>NEWS SETTINGS</SectionLabel>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>RSS refresh</span>
            <SegmentControl
              options={[{ label: '1min', value: 1 }, { label: '2min', value: 2 }, { label: '5min', value: 5 }, { label: '10min', value: 10 }]}
              value={storage.intervals.rssMinutes}
              onChange={(v) => onUpdate({ intervals: { ...storage.intervals, rssMinutes: v as any } })}
            />
          </div>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Flash refresh</span>
            <SegmentControl
              options={[{ label: '15s', value: 15 }, { label: '30s', value: 30 }, { label: '60s', value: 60 }]}
              value={storage.intervals.flashSeconds}
              onChange={(v) => onUpdate({ intervals: { ...storage.intervals, flashSeconds: v as any } })}
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-[10px]" style={{ color: 'var(--cream-2)' }}>Sound alerts</span>
            <Toggle value={storage.alerts.sound} onChange={(v) => onUpdate({ alerts: { ...storage.alerts, sound: v } })} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-body text-[10px]" style={{ color: 'var(--cream-2)' }}>Alert tiers:</span>
            {[1, 2, 3].map((t) => (
              <label key={t} className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--cream-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={storage.alerts.tiers.includes(t as 1 | 2 | 3)}
                  onChange={(e) => {
                    const tiers = e.target.checked
                      ? [...storage.alerts.tiers, t as 1 | 2 | 3]
                      : storage.alerts.tiers.filter((x) => x !== t);
                    onUpdate({ alerts: { ...storage.alerts, tiers } });
                  }}
                />
                TIER {t}
              </label>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* ACCOUNT CONFIG */}
          <SectionLabel>ACCOUNT CONFIG</SectionLabel>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Platform</span>
            <SegmentControl
              options={[{ label: 'Topstep', value: 'topstep' }, { label: 'Apex', value: 'apex' }, { label: 'Other', value: 'other' }]}
              value={storage.account.platform}
              onChange={(v) => {
                const defaults: Record<string, { pdll: number; trailingDD: number }> = {
                  topstep: storage.account.size === 50000 ? { pdll: 1500, trailingDD: 2500 } : storage.account.size === 100000 ? { pdll: 2500, trailingDD: 3000 } : { pdll: 4500, trailingDD: 5000 },
                  apex: { pdll: storage.account.pdll, trailingDD: storage.account.trailingDD },
                  other: { pdll: storage.account.pdll, trailingDD: storage.account.trailingDD },
                };
                onUpdate({ account: { ...storage.account, platform: v as any, ...defaults[v] } });
              }}
            />
          </div>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Account size</span>
            <SegmentControl
              options={[{ label: '$50K', value: 50000 }, { label: '$100K', value: 100000 }, { label: '$150K', value: 150000 }]}
              value={storage.account.size}
              onChange={(v) => {
                const pdllMap: Record<number, number> = { 50000: 1500, 100000: 2500, 150000: 4500 };
                const ddMap: Record<number, number> = { 50000: 2500, 100000: 3000, 150000: 5000 };
                onUpdate({ account: { ...storage.account, size: v, pdll: pdllMap[v] || 1500, trailingDD: ddMap[v] || 2500 } });
              }}
            />
          </div>
          <InputField
            label={`Daily loss limit ($${storage.account.pdll})`}
            value={String(storage.account.pdll)}
            onChange={(v) => onUpdate({ account: { ...storage.account, pdll: parseInt(v) || 0 } })}
          />
          <InputField
            label={`Trailing drawdown ($${storage.account.trailingDD})`}
            value={String(storage.account.trailingDD)}
            onChange={(v) => onUpdate({ account: { ...storage.account, trailingDD: parseInt(v) || 0 } })}
          />
          <p className="font-body text-[9px] italic mb-4" style={{ color: 'var(--cream-3)' }}>
            All thresholds are estimates. This tool is for informational purposes only.
            It is not financial advice and not responsible for trading decisions.
          </p>

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* LAYOUT */}
          <SectionLabel>LAYOUT</SectionLabel>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Right panel</span>
            <SegmentControl
              options={[{ label: 'Always', value: 'always' }, { label: 'Auto-hide', value: 'auto' }, { label: 'Hidden', value: 'hidden' }]}
              value={storage.layout.rightPanel}
              onChange={(v) => onUpdate({ layout: { ...storage.layout, rightPanel: v as any } })}
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-[10px]" style={{ color: 'var(--cream-2)' }}>Compact mode</span>
            <Toggle value={storage.layout.compactMode} onChange={(v) => onUpdate({ layout: { ...storage.layout, compactMode: v } })} />
          </div>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Font size</span>
            <SegmentControl
              options={[{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }]}
              value={storage.layout.fontSize}
              onChange={(v) => onUpdate({ layout: { ...storage.layout, fontSize: v as any } })}
            />
          </div>
          <div className="mb-2">
            <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>View mode</span>
            <SegmentControl
              options={[{ label: 'Columns', value: 'columns' }, { label: 'Stream', value: 'stream' }]}
              value={storage.layout.view}
              onChange={(v) => onUpdate({ layout: { ...storage.layout, view: v as any } })}
            />
          </div>

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* FEED TOGGLES */}
          <SectionLabel>FEED TOGGLES</SectionLabel>
          {Object.entries(feedsByCategory).map(([cat, catFeeds]) => (
            <div key={cat} className="mb-3">
              <div className="font-display text-[9px] tracking-[0.08em] uppercase mb-1" style={{ color: 'var(--cream-3)' }}>
                {cat}
              </div>
              {catFeeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-[5px] h-[5px] rounded-full" style={{ background: feed.color }} />
                    <span className="font-body text-[10px]" style={{ color: 'var(--cream-2)' }}>{feed.name}</span>
                  </div>
                  <Toggle value={getFeedOn(feed.id)} onChange={(v) => toggleFeed(feed.id, v)} />
                </div>
              ))}
            </div>
          ))}

          <div style={{ height: '1px', background: 'var(--void-4)' }} />

          {/* DEBUG */}
          <SectionLabel>DEBUG</SectionLabel>
          <p className="font-body text-[10px] mb-2" style={{ color: 'var(--cream-3)' }}>Debug console: Ctrl+D to toggle</p>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-2 font-display text-[11px] tracking-[0.12em]"
              style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '2px', cursor: 'pointer' }}
            >
              CLEAR ALL STORED DATA
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { clearStorage(); window.location.reload(); }}
                className="flex-1 py-2 font-display text-[11px] tracking-[0.12em]"
                style={{ background: '#e74c3c', border: 'none', color: 'white', borderRadius: '2px', cursor: 'pointer' }}
              >
                CONFIRM
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2 font-display text-[11px] tracking-[0.12em]"
                style={{ background: 'var(--void-4)', border: 'none', color: 'var(--cream-3)', borderRadius: '2px', cursor: 'pointer' }}
              >
                CANCEL
              </button>
            </div>
          )}

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
