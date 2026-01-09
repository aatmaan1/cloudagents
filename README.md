# Property MCP

This repository contains a small **Model Context Protocol (MCP)** server that can produce a **last-6-months summary across all properties** from a local dataset.

## Quick start

```bash
npm install
npm run start
```

The server speaks MCP over stdio.

## Data

By default, the server reads sample data at:

- `data/properties.json`
- `data/events.jsonl`

To point it at your real data, set:

- `PROPERTY_MCP_PROPERTIES_PATH` (JSON array of properties)
- `PROPERTY_MCP_EVENTS_PATH` (JSONL events; one JSON object per line)

## Tools

- `properties_summary_last_months`: returns a portfolio summary + per-property breakdown for the last N months (default 6).

