'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem, FeedDef } from '@/types/trading';
import { classifyHeadline } from '@/lib/keywordTiers';

interface RssFeedResult {
  feedId: string;
  items: NewsItem[];
  error?: string;
}

async function fetchViaRss2json(feed: FeedDef, apiKey: string): Promise<NewsItem[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=15${apiKey ? `&api_key=${apiKey}` : ''}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`rss2json: ${resp.status}`);
  const data = await resp.json();
  if (data.status !== 'ok') throw new Error(`rss2json: ${data.message}`);

  return (data.items || []).map((item: any, idx: number) => ({
    id: `${feed.id}-${item.guid || item.link || idx}`,
    headline: item.title || '',
    source: feed.name,
    pubTime: new Date(item.pubDate || 0).getTime(),
    url: item.link || '',
    category: feed.cat,
    feedId: feed.id,
    tier: classifyHeadline(item.title || ''),
    isNew: false,
  }));
}

async function fetchViaAllOrigins(feed: FeedDef): Promise<NewsItem[]> {
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`allorigins: ${resp.status}`);
  const data = await resp.json();
  const xml = data.contents;
  if (!xml) throw new Error('empty response');

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  const result: NewsItem[] = [];

  items.forEach((item, idx) => {
    if (idx >= 15) return;
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    result.push({
      id: `${feed.id}-${link || idx}`,
      headline: title,
      source: feed.name,
      pubTime: pubDate ? new Date(pubDate).getTime() : 0,
      url: link,
      category: feed.cat,
      feedId: feed.id,
      tier: classifyHeadline(title),
      isNew: false,
    });
  });

  return result;
}

async function fetchFeed(feed: FeedDef, apiKey: string): Promise<RssFeedResult> {
  try {
    const items = await fetchViaRss2json(feed, apiKey);
    return { feedId: feed.id, items };
  } catch {
    try {
      const items = await fetchViaAllOrigins(feed);
      return { feedId: feed.id, items };
    } catch (e: any) {
      return { feedId: feed.id, items: [], error: e?.message || 'fetch failed' };
    }
  }
}

export function useRssFeeds(feeds: FeedDef[], apiKey: string, intervalMin: number) {
  const [feedResults, setFeedResults] = useState<Record<string, RssFeedResult>>({});
  const [lastFetch, setLastFetch] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevItemIds = useRef<Set<string>>(new Set());

  const activeFeeds = feeds.filter((f) => f.on);

  const fetchAll = useCallback(async () => {
    if (activeFeeds.length === 0) return;
    setLoading(true);

    const batchSize = 3;
    const results: Record<string, RssFeedResult> = {};

    for (let i = 0; i < activeFeeds.length; i += batchSize) {
      const batch = activeFeeds.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((f) => fetchFeed(f, apiKey)));
      for (const r of batchResults) {
        results[r.feedId] = r;
      }
      if (i + batchSize < activeFeeds.length) {
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    // Mark new items
    const currentIds = new Set<string>();
    for (const [, result] of Object.entries(results)) {
      for (const item of result.items) {
        currentIds.add(item.id);
        if (!prevItemIds.current.has(item.id)) {
          item.isNew = true;
        }
      }
    }
    prevItemIds.current = currentIds;

    setFeedResults(results);
    setLastFetch(Date.now());
    setLoading(false);
  }, [activeFeeds, apiKey]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, intervalMin * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchAll, intervalMin]);

  return { feedResults, lastFetch, loading, refreshFeeds: fetchAll };
}
