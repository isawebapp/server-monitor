#!/bin/bash

# Check if the user is root or has sudo privileges
if [ "$(id -u)" -ne "0" ]; then
  echo "This script must be run as root or with sudo."
  exit 1
fi

# Define the GitHub release URL (replace with your actual URL)
RELEASE_URL="https://github.com/isawebapp/server-monitor/releases/latest/download/"

# Detect the architecture
ARCH=$(uname -m)

# Download the appropriate binary for the system
if [ "$ARCH" == "x86_64" ]; then
  curl -L $RELEASE_URL/agent-linux-amd64 -o /usr/local/bin/agent
elif [ "$ARCH" == "aarch64" ]; then
  curl -L $RELEASE_URL/agent-linux-arm64 -o /usr/local/bin/agent
else
  echo "Unsupported architecture"
  exit 1
fi

chmod +x /usr/local/bin/agent

# Restart the systemd service
systemctl restart agent.service

echo "Update complete! The agent service has been restarted."
