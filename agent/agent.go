package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/load"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/shirou/gopsutil/v4/process"
)

// NetworkSummary struct to store summarized network statistics
type NetworkSummary struct {
	TotalBytesSent   uint64 `json:"total_bytes_sent"`
	TotalBytesRecv   uint64 `json:"total_bytes_received"`
	TotalPacketsSent uint64 `json:"total_packets_sent"`
	TotalPacketsRecv uint64 `json:"total_packets_received"`
	TotalDropIn      uint64 `json:"total_drop_in"`
	TotalDropOut     uint64 `json:"total_drop_out"`
}

// SystemInfo struct to store all gathered system data
type SystemInfo struct {
	CPUInfo       []cpu.InfoStat         `json:"cpu_info"`
	CPUUsage      []float64              `json:"cpu_usage"`
	Memory        *mem.VirtualMemoryStat `json:"memory"`
	SwapMemory    *mem.SwapMemoryStat    `json:"swap_memory"`
	DiskUsage     *disk.UsageStat        `json:"disk_usage"`
	NetInterfaces []net.InterfaceStat    `json:"network_interfaces"`
	NetworkStats  NetworkSummary         `json:"network_summary"`
	HostInfo      *host.InfoStat         `json:"host_info"`
	LoadAverage   *load.AvgStat          `json:"load_average"`
	ProcessCount  int                    `json:"process_count"`
}

func gatherSystemInfo() SystemInfo {
	// CPU Info
	cpuInfo, _ := cpu.Info()
	cpuPercent, _ := cpu.Percent(0, true)

	// Memory Info
	memInfo, _ := mem.VirtualMemory()
	swapInfo, _ := mem.SwapMemory()

	// Disk Info
	diskUsage, _ := disk.Usage("/")

	// Network Info
	netInterfaces, _ := net.Interfaces()

	// Network Summary Calculation
	netIO, _ := net.IOCounters(true)
	var totalBytesSent, totalBytesRecv, totalPacketsSent, totalPacketsRecv, totalDropIn, totalDropOut uint64
	for _, iface := range netIO {
		totalBytesSent += iface.BytesSent
		totalBytesRecv += iface.BytesRecv
		totalPacketsSent += iface.PacketsSent
		totalPacketsRecv += iface.PacketsRecv
		totalDropIn += iface.Dropin
		totalDropOut += iface.Dropout
	}

	networkSummary := NetworkSummary{
		TotalBytesSent:   totalBytesSent,
		TotalBytesRecv:   totalBytesRecv,
		TotalPacketsSent: totalPacketsSent,
		TotalPacketsRecv: totalPacketsRecv,
		TotalDropIn:      totalDropIn,
		TotalDropOut:     totalDropOut,
	}

	// Host Info
	hostInfo, _ := host.Info()

	// Load Average
	loadAvg, _ := load.Avg()

	// Processes Info
	processes, _ := process.Processes()
	processCount := len(processes) // Get number of processes

	// Build system info struct
	systemInfo := SystemInfo{
		CPUInfo:       cpuInfo,
		CPUUsage:      cpuPercent,
		Memory:        memInfo,
		SwapMemory:    swapInfo,
		DiskUsage:     diskUsage,
		NetInterfaces: netInterfaces,
		NetworkStats:  networkSummary, // Include summarized network stats
		HostInfo:      hostInfo,
		LoadAverage:   loadAvg,
		ProcessCount:  processCount, // Send only the process count
	}
	return systemInfo
}

// Function to send data to webhook URL
func sendToWebhook(url string, data interface{}) {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Fatalf("JSON encoding error: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()

	fmt.Printf("Data successfully sent! Status Code: %d\n", resp.StatusCode)
}

func main() {
	// Webhook URL
	webhookURL := "http://localhost:5000/api/server_data"

	// Create a ticker that ticks every 3 seconds
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// Gather system info
		systemInfo := gatherSystemInfo()

		// Send data
		sendToWebhook(webhookURL, systemInfo)
	}
}
