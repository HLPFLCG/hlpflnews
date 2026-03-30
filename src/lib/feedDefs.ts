import { FeedDef } from '@/types/trading';

export const FEED_DEFS: FeedDef[] = [
  // MARKETS (4)
  { id: 'cnbc-mkt', name: 'CNBC Markets', cat: 'markets', color: '#4fc3f7', on: true, url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
  { id: 'yahoo-fin', name: 'Yahoo Finance', cat: 'markets', color: '#9b59b6', on: true, url: 'https://finance.yahoo.com/news/rssindex' },
  { id: 'mwatch', name: 'MarketWatch', cat: 'markets', color: '#27ae60', on: true, url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
  { id: 'wsj-mkt', name: 'WSJ Markets', cat: 'markets', color: '#2980b9', on: false, url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },

  // MACRO (6)
  { id: 'rtr-biz', name: 'Reuters Business', cat: 'macro', color: '#e8a000', on: true, url: 'https://feeds.reuters.com/reuters/businessNews' },
  { id: 'ap-biz', name: 'AP Business', cat: 'macro', color: '#e67e22', on: true, url: 'https://feeds.apnews.com/rss/apf-business' },
  { id: 'bbc-biz', name: 'BBC Business', cat: 'macro', color: '#bdc3c7', on: true, url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { id: 'fed-news', name: 'Federal Reserve', cat: 'macro', color: '#3498db', on: true, url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
  { id: 'wsj-economy', name: 'WSJ Economy', cat: 'macro', color: '#2980b9', on: true, url: 'https://feeds.a.dj.com/rss/RSSEconomy.xml' },
  { id: 'bis', name: 'BIS Press', cat: 'macro', color: '#2980b9', on: false, url: 'https://www.bis.org/rss/press.rss' },

  // GEOPOLITICAL (5)
  { id: 'rtr-world', name: 'Reuters World', cat: 'geo', color: '#e74c3c', on: true, url: 'https://feeds.reuters.com/reuters/worldNews' },
  { id: 'alj', name: 'Al Jazeera', cat: 'geo', color: '#c0392b', on: true, url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'bbc-world', name: 'BBC World', cat: 'geo', color: '#9b59b6', on: true, url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'rtr-energy', name: 'Reuters Energy', cat: 'geo', color: '#e74c3c', on: true, url: 'https://feeds.reuters.com/reuters/energy' },
  { id: 'middle-east', name: 'Middle East Eye', cat: 'geo', color: '#c0392b', on: true, url: 'https://www.middleeasteye.net/rss' },

  // FX (4)
  { id: 'fxlive', name: 'ForexLive', cat: 'fx', color: '#1abc9c', on: true, url: 'https://www.forexlive.com/feed/news' },
  { id: 'fxstreet', name: 'FXstreet', cat: 'fx', color: '#16a085', on: false, url: 'https://www.fxstreet.com/rss/news' },
  { id: 'dxy-news', name: 'Dollar Strength', cat: 'fx', color: '#1abc9c', on: true, url: 'https://www.dollarcollapse.com/feed/' },
  { id: 'ig-forex', name: 'IG Markets Forex', cat: 'fx', color: '#16a085', on: true, url: 'https://www.ig.com/en/news-and-trade-ideas/forex-news?format=rss' },

  // COMMODITIES (6)
  { id: 'kitco', name: 'Kitco Gold', cat: 'commodities', color: '#f1c40f', on: true, url: 'https://www.kitco.com/rss/kitco-news.xml' },
  { id: 'kitco-gold2', name: 'Kitco Gold Analysis', cat: 'commodities', color: '#f1c40f', on: true, url: 'https://www.kitco.com/rss/kitco-news-gold.xml' },
  { id: 'inv-gold', name: 'Investing.com Gold', cat: 'commodities', color: '#d4ac0d', on: true, url: 'https://www.investing.com/rss/news_25.rss' },
  { id: 'oilprice', name: 'OilPrice.com', cat: 'commodities', color: '#e67e22', on: true, url: 'https://oilprice.com/rss/main' },
  { id: 'gold-eagle', name: 'Gold Eagle', cat: 'commodities', color: '#e6b800', on: false, url: 'https://www.gold-eagle.com/feed' },
  { id: 'silverseek', name: 'Silver Seek', cat: 'commodities', color: '#bdc3c7', on: false, url: 'https://silverseek.com/rss.xml' },

  // ALTERNATIVE (2)
  { id: 'zerohedge', name: 'ZeroHedge', cat: 'alt', color: '#7f8c8d', on: false, url: 'https://feeds.feedburner.com/zerohedge/feed' },
  { id: 'seeking', name: 'Seeking Alpha', cat: 'alt', color: '#636e72', on: false, url: 'https://seekingalpha.com/feed.xml' },
];
