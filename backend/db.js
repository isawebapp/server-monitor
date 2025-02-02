const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server_monitor.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT,
        data TEXT,  -- Store entire JSON object as a string
        timestamp INTEGER
    )`);

    // Create an index for faster queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_host_time ON servers (host_id, timestamp)`);
});

module.exports = db;