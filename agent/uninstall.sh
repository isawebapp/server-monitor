#!/bin/bash

# Check if the user is root or has sudo privileges
if [ "$(id -u)" -ne "0" ]; then
  echo "This script must be run as root or with sudo."
  exit 1
fi

# Stop and disable the systemd service
systemctl stop agent.service
systemctl disable agent.service

# Remove the binary and the service file
rm /usr/local/bin/agent
rm /etc/systemd/system/agent.service

# Reload systemd
systemctl daemon-reload

echo "Uninstallation complete! The agent has been removed and the service disabled."
