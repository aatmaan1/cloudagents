# Slack MCP Integration Setup Guide

## Overview
This guide will help you configure the Slack MCP server to access Slack messages in Cursor.

## Prerequisites
- A Slack workspace where you have admin access or can create apps
- A Slack App with appropriate permissions

## Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name your app (e.g., "Cursor MCP Integration")
5. Select your workspace

## Step 2: Configure App Permissions

1. In your app settings, go to **"OAuth & Permissions"**
2. Scroll down to **"Scopes"** section
3. Add the following **Bot Token Scopes**:
   - `channels:history` - View messages in public channels
   - `channels:read` - View basic channel information
   - `groups:history` - View messages in private channels (if needed)
   - `groups:read` - View basic private channel information (if needed)
   - `users:read` - View people in the workspace
   - `channels:join` - Join public channels

4. Add **User Token Scopes** (if you need to read private channels as the user):
   - `channels:history`
   - `channels:read`
   - `groups:history`
   - `groups:read`

## Step 3: Install the App to Your Workspace

1. Scroll up to **"OAuth Tokens for Your Workspace"**
2. Click **"Install to Workspace"**
3. Review and authorize the permissions
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
   - Keep this token secure! Do not commit it to git.

## Step 4: Invite the Bot to the Channel

In Slack, go to the channel you want to read (e.g., the channel ID `CJK4GKNMS`) and type:
```
/invite @YourBotName
```

## Step 5: Configure MCP Server in Cursor

### Option A: Using the Slack MCP Server (if available)

You need to configure the MCP server in Cursor's settings. The configuration typically goes in:

**macOS/Linux**: `~/.cursor/mcp_config.json`
**Windows**: `%APPDATA%\Cursor\mcp_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token-here",
        "SLACK_TEAM_ID": "your-team-id-here"
      }
    }
  }
}
```

### Option B: Using a Custom Slack MCP Server

If you're using a different Slack MCP implementation, check its documentation for specific configuration requirements.

## Step 6: Get Your Slack Team ID

To find your Slack Team ID:
1. Go to your Slack workspace in a browser
2. The URL will be like: `https://app.slack.com/client/T01234ABC/...`
3. The Team ID is the part starting with `T` (e.g., `T01234ABC`)

## Step 7: Get Channel IDs

To find a channel ID:
1. Right-click on the channel name in Slack
2. Select **"Copy link"**
3. The URL will be like: `https://yourworkspace.slack.com/archives/CJK4GKNMS`
4. The channel ID is the last part (e.g., `CJK4GKNMS`)

## Step 8: Restart Cursor

After configuring the MCP server:
1. Save the configuration file
2. Restart Cursor completely
3. The MCP server should now be available

## Verification

Once configured, I should be able to:
- List available Slack resources (channels, conversations)
- Read messages from channels
- Search for specific content

## Troubleshooting

### MCP Server Not Found
- Ensure the configuration file is in the correct location
- Check that the JSON syntax is valid
- Verify that Node.js/npm is installed on your system

### Authentication Errors
- Verify your Bot Token is correct and hasn't been revoked
- Ensure the bot has been invited to the channels you want to access
- Check that all required scopes are granted

### Permission Errors
- Invite the bot to the specific channel using `/invite @BotName`
- Verify the bot has the necessary OAuth scopes
- For private channels, you may need additional permissions

## Alternative: Manual Export

If MCP setup is complex, you can alternatively:
1. Go to your Slack channel
2. Click the channel name at the top
3. Go to **Settings** → **Additional options** → **Export conversation history**
4. Save the export and share it with me

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit Slack tokens to version control
- Use environment variables or secure secret management
- Regularly rotate your tokens
- Limit bot permissions to only what's necessary
- Review who has access to the configuration file

---

## Next Steps

After completing this setup, let me know and I'll verify the connection and proceed with analyzing the Slack messages for recurring property issues.
