import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ServerDetail from "../components/ServerDetail";

const API_BASE_URL = "http://localhost:16001/api";

function ServerPage() {
  const { id } = useParams();
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/server_data/${id}`);
        setServerData(response.data);
      } catch (error) {
        console.error("Error fetching server data:", error.message);
      }
    };

    fetchServerData();
    const interval = setInterval(fetchServerData, 3000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="container">
      <h1>Server Details</h1>
      {serverData ? <ServerDetail serverData={serverData} /> : <p>Loading...</p>}
    </div>
  );
}

export default ServerPage;
