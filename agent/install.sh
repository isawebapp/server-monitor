#!/bin/bash

# Variables
APP_NAME="server-monitor-agent"
BIN_DIR="/usr/local/bin"
SERVICE_DIR="/etc/systemd/system"
SERVICE_FILE="${SERVICE_DIR}/${APP_NAME}.service"
CONFIG_FILE="/etc/${APP_NAME}/config.yml"

# Step 1: Install Go if not already installed (optional, for automation)
if ! command -v go &> /dev/null
then
    echo "Go not found, please install Go first."
    exit 1
fi

# Step 2: Get the latest release download URL from GitHub API
LATEST_RELEASE_URL="https://api.github.com/repos/isawebapp/server-monitor/releases/latest"
DOWNLOAD_URL=$(curl -s $LATEST_RELEASE_URL | jq -r .assets[0].browser_download_url)

if [ "$DOWNLOAD_URL" == "null" ]; then
    echo "Failed to fetch the latest release download URL."
    exit 1
fi

echo "Latest release download URL: $DOWNLOAD_URL"

# Step 3: Download the Go file
echo "Downloading Go application from $DOWNLOAD_URL"
curl -L $DOWNLOAD_URL -o /tmp/agent.go

# Step 4: Build the Go binary
echo "Building the Go application"
go run /tmp/agent.go -o /tmp/$APP_NAME

# Step 5: Prompt for the Webhook URL
echo "Please enter the Webhook URL for the server monitor:"
read WEBHOOK_URL

# Step 6: Create the config.yml file
echo "Creating the config.yml file"
sudo mkdir -p /etc/${APP_NAME}
echo "webhook_url: ${WEBHOOK_URL}" | sudo tee $CONFIG_FILE

# Step 7: Move binary to /usr/local/bin
echo "Moving the binary to $BIN_DIR"
sudo mv /tmp/$APP_NAME $BIN_DIR/

# Step 8: Create a systemd service file
echo "Creating systemd service file at $SERVICE_FILE"
sudo bash -c "cat > $SERVICE_FILE" << EOF
[Unit]
Description=Server Monitor Agent
After=network.target

[Service]
ExecStart=$BIN_DIR/$APP_NAME
Restart=always
User=nobody
Group=nogroup
WorkingDirectory=/tmp
Environment=PATH=/usr/bin:/usr/local/bin
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Step 9: Reload systemd, enable and start the service
echo "Reloading systemd, enabling and starting the service"
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME.service
sudo systemctl start $APP_NAME.service

echo "Installation complete. The server monitor agent is running."