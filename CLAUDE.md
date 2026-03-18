# CLAUDE.md

## Project Overview

This repository provides setup guides and tools for integrating **Slack MCP (Model Context Protocol)** with **Cursor IDE**. The goal is to enable analysis of Slack channel messages to identify the bottom 10 properties with the most recurring issues and determine what fixes are needed.

Target Slack channel: `CJK4GKNMS`

## Repository Structure

```
cloudagents/
├── README.md                   # Project overview and quick start (two setup paths)
├── SETUP_CHECKLIST.md          # 10-step progress tracking checklist
├── SLACK_MCP_SETUP.md          # Comprehensive step-by-step setup guide
├── mcp_config.template.json    # MCP server config template (fill in tokens)
├── quick_setup.sh              # Bash script to verify environment readiness
└── Start                       # Marker/placeholder file
```

This is a documentation-focused repository — no application source code. All files live in the root directory.

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Entry point. Lists two setup paths: full MCP integration (recommended) or manual Slack export |
| `SETUP_CHECKLIST.md` | 10-step checklist for tracking setup progress |
| `SLACK_MCP_SETUP.md` | Detailed walkthrough for creating a Slack app, configuring permissions, and setting up MCP |
| `mcp_config.template.json` | JSON template for `~/.cursor/mcp_config.json` — requires `SLACK_BOT_TOKEN` and `SLACK_TEAM_ID` |
| `quick_setup.sh` | Verifies Node.js, npm, npx availability and config file location |

## Setup Paths

### Path A — Full MCP Integration (Recommended)
1. Run `./quick_setup.sh` to verify environment
2. Follow `SETUP_CHECKLIST.md` step-by-step
3. Create Slack App with required OAuth scopes (`channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read`, `channels:join`)
4. Copy `mcp_config.template.json` to `~/.cursor/mcp_config.json` and fill in credentials
5. Restart Cursor and verify MCP connection

### Path B — Manual Export
1. Export conversation history from Slack channel `CJK4GKNMS`
2. Save as `slack_messages.json` or `.txt` in workspace
3. Analyze directly

## Configuration

- **MCP config location (macOS/Linux):** `~/.cursor/mcp_config.json`
- **MCP config location (Windows):** `%APPDATA%\Cursor\mcp_config.json`
- **MCP server package:** `@modelcontextprotocol/server-slack` (run via `npx`)
- **Required env vars:** `SLACK_BOT_TOKEN` (xoxb-...), `SLACK_TEAM_ID` (T-...)

## Environment Requirements

- Node.js (verified v22.21.1)
- npm (verified 10.9.4)
- npx

## Security Conventions

- **Never commit Slack tokens** to version control — tokens go in local config files only
- Bot tokens must start with `xoxb-`
- Use environment variables for credentials
- Rotate tokens regularly
- Limit bot permissions to the minimum required scopes

## Git Workflow

- **Main branch:** `main` (remote), `master` (local)
- **Feature branches:** Descriptive names (e.g., `cursor/recurring-property-issues-summary-f0b9`)
- **PR workflow:** Feature branches merged via pull requests
- **Commit style:** Conventional-ish — prefix with `feat:`, `fix:`, etc.

## Conventions for AI Assistants

- All documentation uses Markdown
- Configuration templates use `.template.json` suffix — never overwrite with real credentials
- The `quick_setup.sh` script is executable and OS-aware (macOS/Linux/Windows via msys)
- When editing docs, preserve the existing checklist format in `SETUP_CHECKLIST.md`
- Keep setup instructions consistent across README.md, SETUP_CHECKLIST.md, and SLACK_MCP_SETUP.md
- The six required OAuth scopes must stay in sync across all documentation files
