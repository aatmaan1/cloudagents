# Slack MCP Setup Checklist

Use this checklist to track your progress setting up the Slack MCP integration.

## Setup Progress

- [ ] **Step 1**: Create Slack App at https://api.slack.com/apps
- [ ] **Step 2**: Add required Bot Token Scopes
  - [ ] `channels:history`
  - [ ] `channels:read`
  - [ ] `groups:history`
  - [ ] `groups:read`
  - [ ] `users:read`
  - [ ] `channels:join`
- [ ] **Step 3**: Install app to workspace
- [ ] **Step 4**: Copy Bot User OAuth Token (starts with `xoxb-`)
- [ ] **Step 5**: Find Slack Team ID (starts with `T`)
- [ ] **Step 6**: Find target channel ID (for channel `CJK4GKNMS`)
- [ ] **Step 7**: Invite bot to the channel: `/invite @YourBotName`
- [ ] **Step 8**: Create/update config file at:
  - macOS/Linux: `~/.cursor/mcp_config.json`
  - Windows: `%APPDATA%\Cursor\mcp_config.json`
- [ ] **Step 9**: Restart Cursor
- [ ] **Step 10**: Verify connection by asking Cursor to list MCP resources

## Quick Reference

### Your Slack App Details
Fill these in as you complete setup:

- **App Name**: ___________________________
- **Bot Name**: ___________________________
- **Team ID**: T___________________________
- **Target Channel**: CJK4GKNMS
- **Bot Token**: (Keep this secret! Don't write it here if sharing this file)

### Config File Location

Depending on your OS:
- **macOS/Linux**: `~/.cursor/mcp_config.json`
- **Windows**: `%APPDATA%\Cursor\mcp_config.json`

### Test Command

After setup, run this in the workspace:
```
./quick_setup.sh
```

Then ask Cursor to:
- List MCP resources
- Read messages from the channel

## Troubleshooting

If things aren't working:

1. ✓ Check Node.js is installed: `node --version`
2. ✓ Verify config file location and JSON syntax
3. ✓ Confirm bot token starts with `xoxb-`
4. ✓ Ensure bot is invited to the channel
5. ✓ Verify all OAuth scopes are granted
6. ✓ Restart Cursor completely

## Alternative: Manual Export

If MCP setup is too complex:

1. In Slack, click the channel name
2. Go to Settings → Additional options
3. Export conversation history
4. Save the file to this workspace
5. Notify Cursor to analyze the exported file

---

**Need Help?** See `SLACK_MCP_SETUP.md` for detailed instructions.
