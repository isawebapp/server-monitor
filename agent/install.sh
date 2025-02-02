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

# Create a systemd service file
cat <<EOF > /etc/systemd/system/agent.service
[Unit]
Description=Agent Application
After=network.target

[Service]
ExecStart=/usr/local/bin/agent
Restart=always
User=nobody
Group=nogroup

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable, and start the service
systemctl daemon-reload
systemctl enable agent.service
systemctl start agent.service

echo "Installation complete! The agent service is now running."
