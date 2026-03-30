'use client';

import { useState } from 'react';
import { StorageSchema } from '@/types/trading';

interface Props {
  onComplete: (updates: Partial<StorageSchema>) => void;
}

function StepInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="font-display text-[10px] tracking-[0.08em] uppercase block mb-1" style={{ color: 'var(--gold-dim)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 font-mono text-[11px]"
        style={{
          background: 'var(--void-4)',
          border: '1px solid var(--gold-muted)',
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

export default function SetupModal({ onComplete }: Props) {
  const [finnhubKey, setFinnhubKey] = useState('');
  const [rss2jsonKey, setRss2jsonKey] = useState('');
  const [showTradovate, setShowTradovate] = useState(false);
  const [tvUser, setTvUser] = useState('');
  const [tvPass, setTvPass] = useState('');
  const [tvCid, setTvCid] = useState('');
  const [tvDid, setTvDid] = useState('');
  const [tvSecret, setTvSecret] = useState('');
  const [platform, setPlatform] = useState<'topstep' | 'apex' | 'other'>('topstep');
  const [accountSize, setAccountSize] = useState(50000);
  const [pdll, setPdll] = useState(1500);
  const [trailingDD, setTrailingDD] = useState(2500);
  const [testResults, setTestResults] = useState<Record<string, 'ok' | 'fail' | ''>>({});
  const [step1Attempted, setStep1Attempted] = useState(false);

  const testFinnhub = async () => {
    setStep1Attempted(true);
    if (!finnhubKey) { setTestResults((p) => ({ ...p, finnhub: 'fail' })); return; }
    try {
      const resp = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubKey}`);
      setTestResults((p) => ({ ...p, finnhub: resp.ok ? 'ok' : 'fail' }));
    } catch {
      setTestResults((p) => ({ ...p, finnhub: 'fail' }));
    }
  };

  const testRss2json = async () => {
    if (!rss2jsonKey) { setTestResults((p) => ({ ...p, rss2json: 'fail' })); return; }
    try {
      const resp = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.bbci.co.uk/news/rss.xml')}&api_key=${rss2jsonKey}`);
      const data = await resp.json();
      setTestResults((p) => ({ ...p, rss2json: data.status === 'ok' ? 'ok' : 'fail' }));
    } catch {
      setTestResults((p) => ({ ...p, rss2json: 'fail' }));
    }
  };

  const handleLaunch = () => {
    const pdllMap: Record<number, number> = { 50000: 1500, 100000: 2500, 150000: 4500 };
    const ddMap: Record<number, number> = { 50000: 2500, 100000: 3000, 150000: 5000 };

    onComplete({
      setup_done: true,
      keys: {
        finnhub: finnhubKey,
        rss2json: rss2jsonKey,
        tradovate_user: tvUser,
        tradovate_pass: tvPass,
        tradovate_cid: tvCid,
        tradovate_did: tvDid,
        tradovate_secret: tvSecret,
        tradovate_account_id: '',
      },
      account: {
        platform,
        size: accountSize,
        pdll: pdll || pdllMap[accountSize] || 1500,
        trailingDD: trailingDD || ddMap[accountSize] || 2500,
      },
    });
  };

  const handleSkip = () => {
    onComplete({ setup_done: true });
  };

  const updateSize = (size: number) => {
    setAccountSize(size);
    const pdllMap: Record<number, number> = { 50000: 1500, 100000: 2500, 150000: 4500 };
    const ddMap: Record<number, number> = { 50000: 2500, 100000: 3000, 150000: 5000 };
    setPdll(pdllMap[size] || 1500);
    setTrailingDD(ddMap[size] || 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.96)' }}
    >
      <div
        className="w-full max-w-[520px] mx-4 overflow-y-auto animate-scale-in"
        style={{
          maxHeight: '90vh',
          background: 'var(--void-3)',
          border: '1px solid var(--gold)',
          borderRadius: '4px',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center" style={{ borderBottom: '1px solid var(--void-4)' }}>
          <div className="font-display text-[28px] tracking-[0.12em]" style={{ color: 'var(--gold)' }}>
            HLPFL INTEL FEED
          </div>
          <div className="font-display text-[16px] tracking-[0.12em] mt-1" style={{ color: 'var(--cream-2)' }}>
            SETUP
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Finnhub */}
          <div className="mb-6">
            <div className="font-display text-[12px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
              STEP 1 — FINNHUB API KEY
            </div>
            <p className="font-body text-[12px] mb-3" style={{ color: 'var(--cream-2)', lineHeight: 1.6 }}>
              Get a FREE key at finnhub.io — takes 60 seconds. Enables live market news,
              economic calendar, and near-real-time headline alerts.
            </p>
            <StepInput label="Finnhub API Key" value={finnhubKey} onChange={setFinnhubKey} placeholder="Paste your key here..." />
            <div className="flex items-center gap-3">
              <button
                onClick={testFinnhub}
                className="font-display text-[10px] tracking-[0.12em] px-3 py-1.5"
                style={{ background: 'var(--gold-muted)', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: '2px', cursor: 'pointer' }}
              >
                SAVE & TEST
              </button>
              {testResults.finnhub === 'ok' && <span className="font-mono text-[12px]" style={{ color: '#2ecc71' }}>✓ Connected</span>}
              {testResults.finnhub === 'fail' && <span className="font-mono text-[12px]" style={{ color: '#e74c3c' }}>✗ Failed</span>}
              <a href="https://finnhub.io/dashboard" target="_blank" rel="noopener noreferrer" className="font-body text-[11px]" style={{ color: 'var(--gold)' }}>
                → Get free Finnhub key ↗
              </a>
            </div>
          </div>

          {/* Step 2: rss2json */}
          <div className="mb-6" style={{ borderTop: '1px solid var(--void-4)', paddingTop: '16px' }}>
            <div className="font-display text-[12px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
              STEP 2 — RSS2JSON KEY (RECOMMENDED)
            </div>
            <p className="font-body text-[12px] mb-3" style={{ color: 'var(--cream-2)', lineHeight: 1.6 }}>
              Free key at rss2json.com. Without it, you get ~10 req/hr.
              With the free key: 10,000 req/day — sufficient for 5-min refresh on 27 feeds.
            </p>
            <StepInput label="rss2json API Key" value={rss2jsonKey} onChange={setRss2jsonKey} placeholder="Paste your key..." />
            <div className="flex items-center gap-3">
              <button
                onClick={testRss2json}
                className="font-display text-[10px] tracking-[0.12em] px-3 py-1.5"
                style={{ background: 'var(--gold-muted)', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: '2px', cursor: 'pointer' }}
              >
                SAVE & TEST
              </button>
              {testResults.rss2json === 'ok' && <span className="font-mono text-[12px]" style={{ color: '#2ecc71' }}>✓ Connected</span>}
              {testResults.rss2json === 'fail' && <span className="font-mono text-[12px]" style={{ color: '#e74c3c' }}>✗ Failed</span>}
            </div>
          </div>

          {/* Step 3: Tradovate (collapsed) */}
          <div className="mb-6" style={{ borderTop: '1px solid var(--void-4)', paddingTop: '16px' }}>
            <button
              onClick={() => setShowTradovate((p) => !p)}
              className="flex items-center gap-2 font-display text-[12px] tracking-[0.12em] uppercase w-full text-left"
              style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showTradovate ? '▼' : '▶'} STEP 3 — TRADOVATE (OPTIONAL)
            </button>
            <p className="font-body text-[11px] mt-1" style={{ color: 'var(--cream-3)' }}>
              Connect for live CME prices.
            </p>
            {showTradovate && (
              <div className="mt-3">
                <StepInput label="Username" value={tvUser} onChange={setTvUser} />
                <StepInput label="Password" value={tvPass} onChange={setTvPass} type="password" />
                <StepInput label="Client ID" value={tvCid} onChange={setTvCid} />
                <StepInput label="Device ID" value={tvDid} onChange={setTvDid} />
                <StepInput label="Secret" value={tvSecret} onChange={setTvSecret} type="password" />
              </div>
            )}
          </div>

          {/* Step 4: Account */}
          <div className="mb-6" style={{ borderTop: '1px solid var(--void-4)', paddingTop: '16px' }}>
            <div className="font-display text-[12px] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
              STEP 4 — ACCOUNT SETUP
            </div>
            <p className="font-body text-[12px] mb-3" style={{ color: 'var(--cream-2)' }}>
              Configure drawdown warnings for Topstep/Apex.
            </p>

            <div className="mb-3">
              <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Platform</span>
              <div className="flex gap-1">
                {(['topstep', 'apex', 'other'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className="px-3 py-1 font-mono text-[10px] capitalize"
                    style={{
                      background: platform === p ? 'var(--gold-muted)' : 'transparent',
                      border: `1px solid ${platform === p ? 'var(--gold)' : 'var(--void-4)'}`,
                      color: platform === p ? 'var(--gold)' : 'var(--cream-3)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <span className="font-body text-[10px] block mb-1" style={{ color: 'var(--cream-2)' }}>Account size</span>
              <div className="flex gap-1">
                {[50000, 100000, 150000].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSize(s)}
                    className="px-3 py-1 font-mono text-[10px]"
                    style={{
                      background: accountSize === s ? 'var(--gold-muted)' : 'transparent',
                      border: `1px solid ${accountSize === s ? 'var(--gold)' : 'var(--void-4)'}`,
                      color: accountSize === s ? 'var(--gold)' : 'var(--cream-3)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    ${(s / 1000)}K
                  </button>
                ))}
              </div>
            </div>

            <StepInput label={`Daily loss limit ($)`} value={String(pdll)} onChange={(v) => setPdll(parseInt(v) || 0)} />
            <StepInput label={`Trailing drawdown ($)`} value={String(trailingDD)} onChange={(v) => setTrailingDD(parseInt(v) || 0)} />
            <p className="font-body text-[9px] italic" style={{ color: 'var(--cream-3)' }}>
              Estimates only. Always verify with your prop firm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6" style={{ borderTop: '1px solid var(--void-4)' }}>
          <button
            onClick={handleSkip}
            className="font-body text-[12px]"
            style={{ color: 'var(--cream-3)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip All & Launch Dashboard
          </button>
          <button
            onClick={handleLaunch}
            className="font-display text-[12px] tracking-[0.12em] px-4 py-2"
            style={{
              background: step1Attempted || finnhubKey ? 'var(--gold)' : 'var(--gold-dim)',
              color: 'var(--void)',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              opacity: step1Attempted || finnhubKey ? 1 : 0.5,
            }}
          >
            → LAUNCH DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
