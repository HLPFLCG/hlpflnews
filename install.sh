#!/usr/bin/env bash
# INTEL FEED — Claude Code command installer
# Installs the /intel-feed command globally so it's available in every session.

set -e

COMMANDS_DIR="$HOME/.claude/commands"
DEST="$COMMANDS_DIR/intel-feed.md"

mkdir -p "$COMMANDS_DIR"

cat > "$DEST" << 'COMMAND_EOF'
---
name: intel-feed
description: Manage the INTEL FEED trading news dashboard
arguments:
  - name: action
    description: "Action to perform: (none)=scaffold & open, add <url>, remove <id>, status, open"
    required: false
---

# INTEL FEED — Trading News Dashboard Command

You are managing the INTEL FEED trading news dashboard located at `~/intel-feed/index.html`.

## Action: $ARGUMENTS (default: scaffold and open)

### If no action or empty action:
1. Check if `~/intel-feed/` exists. If not, create it.
2. Copy or scaffold the full `index.html` dashboard into `~/intel-feed/index.html` (use the version from the hlpflnews repo if available, or generate the complete dashboard).
3. Start a simple HTTP server: `cd ~/intel-feed && python3 -m http.server 8888 &`
4. Open `http://localhost:8888` in the default browser.
5. Report: "INTEL FEED is live at http://localhost:8888"

### If action is "add <url>":
1. Read `~/intel-feed/index.html`
2. Parse the URL provided. Determine a sensible `id` and `name` from the URL.
3. Ask which category: markets, macro, geo, fx, commodities, or alt.
4. Add a new feed object to the FEEDS array in the JavaScript section.
5. Save the file. Report: "Added feed: <name> (<url>) to category <category>"

### If action is "remove <id>":
1. Read `~/intel-feed/index.html`
2. Find the feed object with the matching id in the FEEDS array.
3. Remove that entire object (including the trailing comma if needed).
4. Save the file. Report: "Removed feed: <id>"

### If action is "status":
1. Check if `~/intel-feed/index.html` exists.
2. Read the file and list all feed IDs, names, categories, and enabled status.
3. Check if a local server is running on port 8888.
4. Report all findings in a clean table format.

### If action is "open":
1. Check if server is running on 8888. If not, start it.
2. Open `http://localhost:8888` in the default browser.
COMMAND_EOF

echo "✓ Installed: $DEST"
echo "  Use '/intel-feed' in any Claude Code session."
echo ""
echo "  /intel-feed                    → scaffold & open dashboard"
echo "  /intel-feed add https://...    → add a new RSS feed"
echo "  /intel-feed remove kitco       → remove a feed by id"
echo "  /intel-feed status             → show all feeds & server state"
echo "  /intel-feed open               → reopen the dashboard"
