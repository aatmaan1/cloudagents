#!/bin/bash

# Quick Slack MCP Setup Helper Script
# This script helps you set up the Slack MCP integration for Cursor

echo "================================================"
echo "  Slack MCP Integration Setup Helper"
echo "================================================"
echo ""

# Check if Node.js is installed
echo "1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js is installed: $(node --version)"
else
    echo "   ✗ Node.js is NOT installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo ""
echo "2. Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "   ✓ npm is installed: $(npm --version)"
else
    echo "   ✗ npm is NOT installed"
    exit 1
fi

# Check if npx is available
echo ""
echo "3. Checking npx availability..."
if command -v npx &> /dev/null; then
    echo "   ✓ npx is available"
else
    echo "   ✗ npx is NOT available"
    exit 1
fi

# Determine config location
echo ""
echo "4. Determining config file location..."
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_PATH="$HOME/.cursor/mcp_config.json"
    echo "   Config path: $CONFIG_PATH"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    CONFIG_PATH="$APPDATA/Cursor/mcp_config.json"
    echo "   Config path: $CONFIG_PATH"
else
    echo "   ⚠ Unknown OS type: $OSTYPE"
    echo "   Please manually locate your Cursor config directory"
fi

# Check if config exists
echo ""
echo "5. Checking existing configuration..."
if [ -f "$CONFIG_PATH" ]; then
    echo "   ✓ Config file exists at: $CONFIG_PATH"
    echo "   ⚠ WARNING: You'll need to merge the Slack MCP config with existing config"
else
    echo "   ℹ Config file does not exist yet"
    echo "   You can create it at: $CONFIG_PATH"
fi

# Provide next steps
echo ""
echo "================================================"
echo "  Next Steps:"
echo "================================================"
echo ""
echo "1. Create a Slack App at: https://api.slack.com/apps"
echo ""
echo "2. Add these Bot Token Scopes:"
echo "   - channels:history"
echo "   - channels:read"
echo "   - groups:history"
echo "   - groups:read"
echo "   - users:read"
echo "   - channels:join"
echo ""
echo "3. Install the app to your workspace"
echo ""
echo "4. Copy your Bot User OAuth Token (starts with xoxb-)"
echo ""
echo "5. Find your Team ID from Slack URL (starts with T)"
echo ""
echo "6. Create or update config file at:"
echo "   $CONFIG_PATH"
echo ""
echo "7. Use the template from: mcp_config.template.json"
echo ""
echo "8. Restart Cursor"
echo ""
echo "================================================"
echo ""
echo "For detailed instructions, see: SLACK_MCP_SETUP.md"
echo ""
