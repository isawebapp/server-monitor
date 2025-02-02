#!/bin/bash

# Variables
APP_NAME="server-monitor-agent"
BIN_DIR="/usr/local/bin"
SERVICE_DIR="/etc/systemd/system"
SERVICE_FILE="${SERVICE_DIR}/${APP_NAME}.service"
CONFIG_DIR="/etc/${APP_NAME}"

# Step 1: Stop the service
echo "Stopping the service"
sudo systemctl stop $APP_NAME.service

# Step 2: Disable the service
echo "Disabling the service"
sudo systemctl disable $APP_NAME.service

# Step 3: Remove the systemd service file
echo "Removing the service file"
sudo rm -f $SERVICE_FILE

# Step 4: Remove the binary
echo "Removing the binary from $BIN_DIR"
sudo rm -f $BIN_DIR/$APP_NAME

# Step 5: Remove the config file
echo "Removing the config file"
sudo rm -rf $CONFIG_DIR

# Step 6: Reload systemd
echo "Reloading systemd"
sudo systemctl daemon-reload

echo "Uninstallation complete."