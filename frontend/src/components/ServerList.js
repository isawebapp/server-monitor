import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../index.css"; // Import CSS file

function ServerList() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/servers");
        setServers(response.data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
    const interval = setInterval(fetchServers, 3000); // Auto-refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>Server List</h1>
      <ul className="server-list">
        {servers.length > 0 ? (
          servers.map((server) => (
            <li key={server.host_id} className="server-item">
              <Link to={`/server/${server.host_id}`}>
                {server.hostname} - {server.platform} ({server.os})
              </Link>
            </li>
          ))
        ) : (
          <p>No servers found.</p>
        )}
      </ul>
    </div>
  );
}

export default ServerList;
