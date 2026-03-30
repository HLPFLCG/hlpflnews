export interface PriceTile {
  symbol: string;
  label: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  updatedAt: number;
  source: 'yahoo' | 'tradovate' | 'proxy';
  isStale: boolean;
  session: 'RTH' | 'ETH' | 'CLOSED';
  tickValue: number;
  pointValue: number;
  contractInfo: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  pubTime: number;
  url: string;
  category: string;
  feedId?: string;
  tier: 0 | 1 | 2 | 3;
  isNew: boolean;
}

export interface EconEvent {
  id: string;
  time: number;
  name: string;
  impact: 'high' | 'medium' | 'low';
  prev: string;
  forecast: string;
  actual: string;
  country: string;
  isHighImpact: boolean;
  minsUntil: number;
}

export interface FeedDef {
  id: string;
  name: string;
  cat: 'markets' | 'macro' | 'geo' | 'fx' | 'commodities' | 'alt';
  color: string;
  on: boolean;
  url: string;
}

export interface AccountState {
  dailyPnL: number;
  balance: number;
  pdllDistance: number;
  ddDistance: number;
  pdllPct: number;
  ddPct: number;
  connected: boolean;
}

export interface StorageSchema {
  setup_done: boolean;
  keys: {
    rss2json: string;
    finnhub: string;
    tradovate_user: string;
    tradovate_pass: string;
    tradovate_cid: string;
    tradovate_did: string;
    tradovate_secret: string;
    tradovate_account_id: string;
  };
  feeds: Array<{ id: string; on: boolean }>;
  layout: {
    rightPanel: 'always' | 'auto' | 'hidden';
    compactMode: boolean;
    fontSize: 'sm' | 'md' | 'lg';
    view: 'columns' | 'stream';
  };
  intervals: {
    priceSeconds: 5 | 10 | 30 | 60;
    flashSeconds: 15 | 30 | 60;
    rssMinutes: 1 | 2 | 5 | 10;
  };
  account: {
    size: number;
    platform: 'topstep' | 'apex' | 'other';
    pdll: number;
    trailingDD: number;
  };
  alerts: {
    sound: boolean;
    tiers: Array<1 | 2 | 3>;
  };
  filter: string;
}

export interface InstrumentDef {
  symbol: string;
  label: string;
  tickValue: number;
  pointValue: number;
  contractInfo: string;
}
