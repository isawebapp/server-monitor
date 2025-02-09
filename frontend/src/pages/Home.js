import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:16001/api";

function Home() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/server_data`);
        setServers(response.data);
      } catch (error) {
        console.error("Error fetching server list:", error.message);
      }
    };

    fetchServers();
    const interval = setInterval(fetchServers, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>Server List</h1>
      {servers.length > 0 ? (
        <ul>
          {servers.map((server, index) => (
            <li key={server.id || index}>  {/* Ensure unique key */}
              <Link to={`/server/${server.id}`}>
                {server.hostname} ({server.id})
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No servers available</p>
      )}
    </div>
  );
}

export default Home;
