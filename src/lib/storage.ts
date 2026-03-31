import { StorageSchema } from '@/types/trading';

const NAMESPACE = 'hlpfl_feed_v2';

const DEFAULTS: StorageSchema = {
  setup_done: false,
  keys: {
    rss2json: '',
    finnhub: '',
    tradovate_user: '',
    tradovate_pass: '',
    tradovate_cid: '',
    tradovate_did: '',
    tradovate_secret: '',
    tradovate_account_id: '',
  },
  feeds: [],
  layout: {
    rightPanel: 'always',
    compactMode: false,
    fontSize: 'md',
    view: 'columns',
  },
  intervals: {
    priceSeconds: 5,
    flashSeconds: 30,
    rssMinutes: 5,
  },
  account: {
    size: 50000,
    platform: 'topstep',
    pdll: 1500,
    trailingDD: 2500,
  },
  alerts: {
    sound: true,
    tiers: [1, 2],
  },
  filter: 'all',
};

function migrateOldKeys(): Partial<StorageSchema> {
  if (typeof window === 'undefined') return {};
  const migrated: Partial<StorageSchema> = {};

  const oldPrefs = localStorage.getItem('feed_prefs');
  if (oldPrefs) {
    try {
      const parsed = JSON.parse(oldPrefs);
      if (parsed.feeds) migrated.feeds = parsed.feeds;
      if (parsed.layout) migrated.layout = { ...DEFAULTS.layout, ...parsed.layout };
    } catch { /* ignore */ }
    localStorage.removeItem('feed_prefs');
  }

  const oldKey = localStorage.getItem('rss2json_key');
  if (oldKey) {
    migrated.keys = { ...DEFAULTS.keys, rss2json: oldKey };
    localStorage.removeItem('rss2json_key');
  }

  return migrated;
}

export function loadStorage(): StorageSchema {
  if (typeof window === 'undefined') return DEFAULTS;

  const raw = localStorage.getItem(NAMESPACE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed, keys: { ...DEFAULTS.keys, ...parsed.keys }, layout: { ...DEFAULTS.layout, ...parsed.layout }, intervals: { ...DEFAULTS.intervals, ...parsed.intervals }, account: { ...DEFAULTS.account, ...parsed.account }, alerts: { ...DEFAULTS.alerts, ...parsed.alerts } };
    } catch { /* ignore */ }
  }

  const migrated = migrateOldKeys();
  if (Object.keys(migrated).length > 0) {
    const merged = { ...DEFAULTS, ...migrated };
    saveStorage(merged);
    return merged;
  }

  return DEFAULTS;
}

export function saveStorage(data: StorageSchema): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NAMESPACE, JSON.stringify(data));
}

export function updateStorage(partial: Partial<StorageSchema>): StorageSchema {
  const current = loadStorage();
  const updated = { ...current, ...partial };
  saveStorage(updated);
  return updated;
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(NAMESPACE);
}

export { DEFAULTS as STORAGE_DEFAULTS };
