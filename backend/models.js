const db = require('./db');

/**
 * Save incoming server data to SQLite.
 */
function saveServerData(data) {
    const timestamp = Math.floor(Date.now() / 1000); // Get current UNIX timestamp
    const jsonData = JSON.stringify(data); // Convert object to string

    db.run(`INSERT INTO servers (host_id, data, timestamp) VALUES (?, ?, ?)`, 
        [data.host_info.hostId, jsonData, timestamp],
        (err) => {
            if (err) console.error("Database Insert Error:", err);
        }
    );

    // Delete old records (keep only last 30 seconds)
    db.run(`DELETE FROM servers WHERE timestamp < ?`, [timestamp - 30]);
}

/**
 * Retrieve the last 30 seconds of data for a specific server.
 */
function getServerData(host_id, callback) {
    const timestamp = Math.floor(Date.now() / 1000) - 30; // Get last 30 seconds of data

    db.all(`SELECT data, timestamp FROM servers WHERE host_id = ? AND timestamp >= ? ORDER BY timestamp ASC`, 
        [host_id, timestamp], 
        (err, rows) => {
            if (err) return callback(err);
            if (!rows || rows.length === 0) return callback(null, []);

            // Convert all JSON data back to objects and ensure timestamps exist
            const serverDataList = rows.map(row => {
                let parsedData = JSON.parse(row.data);
                parsedData.timestamp = row.timestamp || Math.floor(Date.now() / 1000); // Ensure timestamp exists
                return parsedData;
            });

            callback(null, serverDataList);
        }
    );
}

/**
 * Retrieve a list of all available servers.
 */
function getAllServers(callback) {
    db.all(`SELECT host_id, data FROM servers GROUP BY host_id`, [], (err, rows) => {
        if (err) return callback(err);

        const serverList = rows.map(row => {
            try {
                const parsedData = JSON.parse(row.data);
                return {
                    id: row.host_id,
                    hostname: parsedData.host_info?.hostname || "Unknown"
                };
            } catch (error) {
                console.error("Error parsing JSON for host_id:", row.host_id, error);
                return { id: row.host_id, hostname: "Unknown" }; // Handle invalid JSON data
            }
        });

        callback(null, serverList);
    });
}

module.exports = { saveServerData, getServerData, getAllServers };