#!/bin/bash

# Define variables
APP_NAME="monitor-agent"
APP_URL="https://raw.githubusercontent.com/isawebapp/server-monitor/refs/heads/main/agent/agent.go"  # Change this to the actual URL
INSTALL_DIR="/usr/local/bin"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"

# Update and install dependencies
echo "Updating system and installing Go..."
apt update && apt install -y golang

# Create a temporary working directory
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR" || exit 1

# Download the Go application
echo "Downloading the application..."
curl -o "$APP_NAME.go" -L "$APP_URL"

# Build the Go application
echo "Building the application..."
go build -o "$APP_NAME" "$APP_NAME.go"

# Move the binary to the installation directory
echo "Installing the application..."
mv "$APP_NAME" "$INSTALL_DIR/"

# Create systemd service file
echo "Creating systemd service..."
cat <<EOF | tee "$SERVICE_FILE"
[Unit]
Description=Agent Service
After=network.target

[Service]
ExecStart=$INSTALL_DIR/$APP_NAME
Restart=always
User=root
WorkingDirectory=$INSTALL_DIR

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable, and start the service
echo "Enabling and starting the service..."
systemctl daemon-reload
systemctl enable "$APP_NAME"
systemctl start "$APP_NAME"

# Clean up
rm -rf "$TMP_DIR"

echo "Installation complete. Service is running."
