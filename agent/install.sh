#!/bin/bash

# Variables
APP_NAME="server-monitor-agent"
BIN_DIR="/usr/local/bin"
SERVICE_DIR="/etc/systemd/system"
SERVICE_FILE="${SERVICE_DIR}/${APP_NAME}.service"
DOWNLOAD_URL="https://github.com/isawebapp/server-monitor/releases/download/v0.0.1/agent.go"
CONFIG_FILE="/etc/${APP_NAME}/config.yml"

# Step 1: Install Go if not already installed (optional, for automation)
if ! command -v go &> /dev/null
then
    echo "Go not found, please install Go first."
    exit 1
fi

# Step 2: Download the Go file
echo "Downloading Go application from $DOWNLOAD_URL"
curl -L $DOWNLOAD_URL -o /tmp/agent.go

# Step 3: Build the Go binary
echo "Building the Go application"
go run /tmp/agent.go -o /tmp/$APP_NAME

# Step 4: Prompt for the Webhook URL
echo "Please enter the Webhook URL for the server monitor:"
read WEBHOOK_URL

# Step 5: Create the config.yml file
echo "Creating the config.yml file"
sudo mkdir -p /etc/${APP_NAME}
echo "webhook_url: ${WEBHOOK_URL}" | sudo tee $CONFIG_FILE

# Step 6: Move binary to /usr/local/bin
echo "Moving the binary to $BIN_DIR"
sudo mv /tmp/$APP_NAME $BIN_DIR/

# Step 7: Create a systemd service file
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

# Step 8: Reload systemd, enable and start the service
echo "Reloading systemd, enabling and starting the service"
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME.service
sudo systemctl start $APP_NAME.service

echo "Installation complete. The server monitor agent is running."