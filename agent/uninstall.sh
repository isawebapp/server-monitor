#!/bin/bash

# Define variables
APP_NAME="monitor-agent"
INSTALL_DIR="/usr/local/bin"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"

# Stop the systemd service if it's running
echo "Stopping the service..."
systemctl stop "$APP_NAME"

# Disable the systemd service
echo "Disabling the service..."
systemctl disable "$APP_NAME"

# Remove the systemd service file
echo "Removing the systemd service file..."
rm -f "$SERVICE_FILE"

# Remove the binary from the installation directory
echo "Removing the application binary..."
rm -f "$INSTALL_DIR/$APP_NAME"

# Reload systemd to apply changes
echo "Reloading systemd..."
systemctl daemon-reload

echo "Uninstallation complete. The $APP_NAME application has been removed."