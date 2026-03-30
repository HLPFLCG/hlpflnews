'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AccountState } from '@/types/trading';
import { getFrontMonth } from '@/lib/contractMonths';

type TvState = 'disconnected' | 'authenticating' | 'connected' | 'error' | 'reconnecting';

interface TradovateConfig {
  user: string;
  pass: string;
  cid: string;
  did: string;
  secret: string;
  accountId: string;
}

interface TradovateResult {
  state: TvState;
  accountState: AccountState;
  error: string;
  priceUpdates: Record<string, number>;
}

export function useTradovate(
  config: TradovateConfig,
  accountPdll: number,
  accountTrailingDD: number,
  onPriceUpdate?: (symbol: string, price: number) => void,
): TradovateResult {
  const [state, setState] = useState<TvState>('disconnected');
  const [error, setError] = useState('');
  const [accountState, setAccountState] = useState<AccountState>({
    dailyPnL: 0,
    balance: 0,
    pdllDistance: accountPdll,
    ddDistance: accountTrailingDD,
    pdllPct: 0,
    ddPct: 0,
    connected: false,
  });
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});

  const accessTokenRef = useRef('');
  const mdAccessTokenRef = useRef('');
  const wsRef = useRef<WebSocket | null>(null);
  const renewTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectDelay = useRef(2000);

  const isConfigured = config.user && config.pass && config.cid;

  const authenticate = useCallback(async () => {
    if (!isConfigured) return;

    setState('authenticating');
    try {
      const resp = await fetch('https://demo.tradovateapi.com/v1/auth/accesstokenrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.user,
          password: config.pass,
          appId: 'hlpfl-intel-feed',
          appVersion: '1.0',
          deviceId: config.did || 'hlpfl-device',
          cid: parseInt(config.cid) || 0,
          sec: config.secret,
        }),
      });

      if (!resp.ok) {
        setState('error');
        setError(`Auth failed: ${resp.status}`);
        return;
      }

      const data = await resp.json();
      if (!data.accessToken) {
        setState('error');
        setError('No access token in response');
        return;
      }

      accessTokenRef.current = data.accessToken;
      mdAccessTokenRef.current = data.mdAccessToken || data.accessToken;
      setState('connected');
      setAccountState((prev) => ({ ...prev, connected: true }));

      // Schedule token renewal at 75 minutes
      renewTimeoutRef.current = setTimeout(authenticate, 75 * 60 * 1000);

      // Connect market data WebSocket
      connectMdWs();
    } catch (e: any) {
      setState('error');
      setError(e?.message || 'Auth failed');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isConfigured]);

  const connectMdWs = useCallback(() => {
    if (!mdAccessTokenRef.current) return;

    try {
      const ws = new WebSocket('wss://md-demo.tradovateapi.com/v1/websocket');
      wsRef.current = ws;

      ws.onopen = () => {
        // SockJS auth frame
        ws.send(`authorize\n0\n\n${mdAccessTokenRef.current}`);

        // Subscribe to front-month contracts
        const symbols = ['ES=F', 'NQ=F', 'GC=F', 'SI=F'];
        symbols.forEach((sym, i) => {
          const frontMonth = getFrontMonth(sym);
          ws.send(JSON.stringify({
            url: 'md/subscribequote',
            body: { symbol: frontMonth },
            i: i + 1,
          }));
        });

        reconnectDelay.current = 2000;
      };

      ws.onmessage = (evt) => {
        try {
          // Parse SockJS frames
          const raw = evt.data;
          if (typeof raw !== 'string') return;

          // Try to extract JSON from frame
          const jsonMatch = raw.match(/\{.*\}/);
          if (!jsonMatch) return;

          const data = JSON.parse(jsonMatch[0]);
          if (data.d?.quotes) {
            for (const quote of data.d.quotes) {
              if (quote.entries?.Trade?.price) {
                const price = quote.entries.Trade.price;
                const contractId = quote.contractId;

                setPriceUpdates((prev) => ({ ...prev, [String(contractId)]: price }));

                // Map back to Yahoo symbol
                const symbolMap: Record<string, string> = {};
                const symbols = ['ES=F', 'NQ=F', 'GC=F', 'SI=F'];
                symbols.forEach((sym) => {
                  symbolMap[getFrontMonth(sym)] = sym;
                });

                if (onPriceUpdate) {
                  // We'd need contract mapping - for now emit by contractId
                  onPriceUpdate(String(contractId), price);
                }
              }
            }
          }
        } catch { /* parse error */ }
      };

      ws.onclose = () => {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
          setState('reconnecting');
          connectMdWs();
        }, reconnectDelay.current);
      };

      ws.onerror = () => ws.close();
    } catch { /* ws error */ }
  }, [onPriceUpdate]);

  // Fetch account data
  useEffect(() => {
    if (state !== 'connected' || !config.accountId || !accessTokenRef.current) return;

    async function fetchAccount() {
      try {
        const headers = { Authorization: `Bearer ${accessTokenRef.current}` };

        const [balResp, pnlResp] = await Promise.all([
          fetch(`https://demo.tradovateapi.com/v1/account/item?id=${config.accountId}`, { headers }),
          fetch(`https://demo.tradovateapi.com/v1/cashBalance/getCashBalanceSnapshot?accountId=${config.accountId}`, { headers }),
        ]);

        let balance = 0;
        let dailyPnL = 0;

        if (balResp.ok) {
          const data = await balResp.json();
          balance = data.balance || 0;
        }
        if (pnlResp.ok) {
          const data = await pnlResp.json();
          dailyPnL = data.realizedPnL || 0;
        }

        const pdllDistance = accountPdll - Math.abs(dailyPnL);
        const ddDistance = accountTrailingDD - Math.abs(dailyPnL);
        const pdllPct = accountPdll > 0 ? (Math.abs(dailyPnL) / accountPdll) * 100 : 0;
        const ddPct = accountTrailingDD > 0 ? (Math.abs(dailyPnL) / accountTrailingDD) * 100 : 0;

        setAccountState({
          dailyPnL,
          balance,
          pdllDistance,
          ddDistance,
          pdllPct,
          ddPct,
          connected: true,
        });
      } catch { /* network error */ }
    }

    fetchAccount();
    const id = setInterval(fetchAccount, 30000);
    return () => clearInterval(id);
  }, [state, config.accountId, accountPdll, accountTrailingDD]);

  // Initial auth
  useEffect(() => {
    if (isConfigured) authenticate();

    return () => {
      wsRef.current?.close();
      if (renewTimeoutRef.current) clearTimeout(renewTimeoutRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [authenticate, isConfigured]);

  return { state, accountState, error, priceUpdates };
}
