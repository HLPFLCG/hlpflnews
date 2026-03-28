# INTEL FEED — Trading News Dashboard

A standalone, client-side trading news dashboard that aggregates 17 live RSS feeds across 6 categories. Zero server required — just open `index.html` in any browser.

## Quick Start

```bash
# Option 1: Just open it
open index.html
# (or double-click index.html in your file manager)

# Option 2: Install the Claude Code command
bash install.sh
# Then in any Claude Code session:
/intel-feed
```

## Feeds (17 sources, 6 categories)

| Category | Sources |
|----------|---------|
| **Markets** | CNBC Markets, Yahoo Finance, MarketWatch, WSJ |
| **Macro** | Reuters Business, AP Business, BBC Business |
| **Geo** | Reuters World, Al Jazeera, BBC World, AP Top News |
| **FX/Futures** | ForexLive, FXStreet |
| **Commodities** | Kitco Gold, Investing.com Gold |
| **Alt** | ZeroHedge, Seeking Alpha |

## Features

- **Auto-refresh** with configurable interval (1–15 min), countdown with amber warning at 30s
- **Columns view** — each source in its own scrollable column
- **Stream view** — all items merged, sorted newest-first
- **Category filter pills** — quickly narrow by Markets, Macro, Geo, etc.
- **Live search** with highlight matching across all feeds
- **Age color-coding** — green (< 1hr), amber (1–6hr), gray (older)
- **Persistent settings** — enabled feeds, API key, interval, item count saved in localStorage
- **Dual proxy fallback** — rss2json.com → allorigins.win

## API Key (Recommended)

Without a key: ~10 requests/hour (fine for casual browsing).
With free key: 10,000 requests/day (sustains auto-refresh with all feeds).

1. Go to [rss2json.com](https://rss2json.com)
2. Sign up (free, 2 min)
3. Copy your API key
4. Paste it into ⚙ Sources panel in the dashboard

## Claude Code Command

After running `bash install.sh`, use in any session:

```
/intel-feed                    → scaffold ~/intel-feed/, open in browser
/intel-feed add https://...    → add a new RSS feed
/intel-feed remove kitco       → remove a feed by id
/intel-feed status             → report all feeds & server state
/intel-feed open               → reopen the dashboard
```
