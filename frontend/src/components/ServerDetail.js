import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { formatBytes, formatTime } from "../utils"; // Import helper function


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title);

function ServerDetail({ serverData }) {
  const [chartData, setChartData] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // Track expanded table row

  useEffect(() => {
    if (!serverData || !Array.isArray(serverData) || serverData.length === 0) return;

    const timestamps = serverData.map((s) => new Date(s.timestamp * 1000).toLocaleTimeString());
    const cpuUsage = serverData.map((s) => (s.cpu_info && s.cpu_info.length > 0 ? s.cpu_info[0].mhz : 0));
    const memoryUsage = serverData.map((s) => (s.memory ? (s.memory.usedPercent) : 0));
    const swapUsage = serverData.map((s) => (s.memory ? (s.swap_memory.usedPercent) : 0));
    const diskUsage = serverData.map((s) => (s.disk_usage ? (s.disk_usage.usedPercent) : 0));
    const networkSent = serverData.map((s) => s.network_summary ? s.network_summary.total_bytes_sent : 0);
    const networkReceived = serverData.map((s) => s.network_summary ? s.network_summary.total_bytes_received : 0);
    const processCount = serverData.map((s) => s.process_count || 0);

    setChartData({
      labels: timestamps,
      datasets: [
        { label: "CPU Speed (MHz)", data: cpuUsage, borderColor: "red" },
        { label: "Memory Usage (%)", data: memoryUsage, borderColor: "blue" },
        { label: "Swap Memory Usage (%)", data: swapUsage, borderColor: "blue" },
        { label: "Disk Usage (%)", data: diskUsage, borderColor: "green" },
        { label: "Network In (Bytes)", data: networkReceived, borderColor: "purple" },
        { label: "Network Out (Bytes)", data: networkSent, borderColor: "purple" },
        { label: "Processes", data: processCount, borderColor: "orange" },
      ],
    });

    return () => setChartData(null);
  }, [serverData]);

  if (!serverData || serverData.length === 0) return <p>No data available</p>;

  const latestData = serverData[serverData.length - 1];

  return (
    <div className="container">
      <h2>Host Information</h2>
      <p><strong>Hostname:</strong> {latestData.host_info.hostname}</p>
      <p><strong>OS:</strong> {latestData.host_info.os} ({latestData.host_info.platform} {latestData.host_info.platformVersion})</p>
      <p><strong>Kernel:</strong> {latestData.host_info.kernelVersion} ({latestData.host_info.kernelArch})</p>
      <p><strong>Virtualization:</strong> {latestData.host_info.virtualizationSystem} ({latestData.host_info.virtualizationRole})</p>
      <p><strong>Uptime:</strong> {formatTime(latestData.host_info.uptime)} seconds</p>
      <p><strong>Boot Time:</strong> {formatTime(latestData.host_info.bootTime)} seconds</p>
      <p><strong>Processes:</strong> {latestData.host_info.procs}</p>

      <h2>Load Average</h2>
      <p><strong>Load 1:</strong> {latestData.load_average.load1}</p>
      <p><strong>Load 5:</strong> {latestData.load_average.load5}</p>
      <p><strong>Load 15:</strong> {latestData.load_average.load15}</p>

      <h2>CPU Information</h2>
      {latestData.cpu_info.map((cpu, index) => (
        <div key={index}>
          <p><strong>Model:</strong> {cpu.modelName}</p>
          <p><strong>Cores:</strong> {cpu.cores}</p>
          <p><strong>Speed:</strong> {cpu.mhz} MHz</p>
          <p><strong>Cache Size:</strong> {formatBytes(cpu.cacheSize)}</p>
        </div>
      ))}

      <h2>Memory Usage</h2>
      <p><strong>Used:</strong> {formatBytes(latestData.memory.used)}</p>
      <p><strong>Free:</strong> {formatBytes(latestData.memory.free)}</p>
      <p><strong>Total:</strong> {formatBytes(latestData.memory.total)}</p>

      <h2>Swap Memory Usage</h2>
      <p><strong>Used:</strong> {formatBytes(latestData.swap_memory.used)}</p>
      <p><strong>Free:</strong> {formatBytes(latestData.swap_memory.free)}</p>
      <p><strong>Total:</strong> {formatBytes(latestData.swap_memory.total)}</p>


      <h2>Disk Usage</h2>
      <p><strong>Used:</strong> {formatBytes(latestData.disk_usage.used)}</p>
      <p><strong>Free:</strong> {formatBytes(latestData.disk_usage.free)}</p>
      <p><strong>Total:</strong> {formatBytes(latestData.disk_usage.total)}</p>

      <h2>Network Interfaces</h2>
      {latestData.network_interfaces && latestData.network_interfaces.length > 0 ? (
        <table border="1" cellPadding="5" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {latestData.network_interfaces.map((net, index) => (
              <React.Fragment key={index}>
                {/* Clickable row to toggle expansion */}
                <tr onClick={() => setExpandedRow(expandedRow === index ? null : index)} style={{ cursor: "pointer" }}>
                  <td>{net.name || "N/A"}</td>
                  <td>
                    <button onClick={(e) => {
                      e.stopPropagation(); // Prevent row click from firing
                      setExpandedRow(expandedRow === index ? null : index);
                    }}>
                      {expandedRow === index ? "Close" : "Open"}
                    </button>
                  </td>
                </tr>

                {/* Expandable details row */}
                {expandedRow === index && (
                  <tr>
                    <td colSpan="2">
                      <h4>Details</h4>
                      <p><strong>Hardware Address:</strong> {net.hardwareAddr || "N/A"}</p>
                      <p><strong>MTU:</strong> {net.mtu || "N/A"}</p>
                      <p><strong>Flags:</strong> {Array.isArray(net.flags) ? net.flags.join(", ") : "N/A"}</p>
                      <p><strong>Index:</strong> {net.index || "N/A"}</p>
                      <p><strong>Addresses:</strong></p>
                      <ul>
                        {Array.isArray(net.addrs) && net.addrs.length > 0 ? (
                          net.addrs.map((addr, i) => <li key={i}>{addr.addr || "N/A"}</li>)
                        ) : (
                          <li>No addresses available</li>
                        )}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No network interfaces available</p>
      )}


      <h2>Network Summary</h2>
      <p><strong>Bytes Sent:</strong> {formatBytes(latestData.network_summary.total_bytes_sent)}</p>
      <p><strong>Bytes Received:</strong> {formatBytes(latestData.network_summary.total_bytes_received)}</p>
      <p><strong>Package Sent:</strong> {formatBytes(latestData.network_summary.total_packets_sent)}</p>
      <p><strong>Package Received:</strong> {formatBytes(latestData.network_summary.total_packets_received)}</p>

      <h2>Server Performance (Last 30 Seconds)</h2>
      {chartData ? (
        <>
          {chartData.datasets.map((dataset, index) => (
            <div key={index}>
              <h2>{dataset.label}</h2>
              <Line
                data={{ labels: chartData.labels, datasets: [dataset] }}
                options={{ responsive: true, plugins: { legend: { display: true } }, animation: false }}
              />
            </div>
          ))}
        </>
      ) : (
        <p>Loading charts...</p>
      )}
    </div>
  );
}

export default ServerDetail;
