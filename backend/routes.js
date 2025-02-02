const express = require('express');
const { saveServerData, getServerData, getAllServers } = require('./models');
const db = require('./db'); // Import SQLite database

const router = express.Router();

/**
 * @route POST /api/server_data
 * @desc Receive and store server data
 */
router.post('/server_data', (req, res) => {
    try {
        saveServerData(req.body);
        res.status(200).send({ message: 'Data saved successfully' });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send({ error: 'Failed to save data' });
    }
});

/**
 * @route GET /api/server_data/:id
 * @desc Retrieve the last 30 seconds of data for a specific server
 */
router.get('/server_data/:id', (req, res) => {
    getServerData(req.params.id, (err, serverData) => {
        if (err) {
            console.error("Error retrieving server data:", err);
            return res.status(500).send({ error: 'Failed to get server data' });
        }
        if (!serverData || serverData.length === 0) {
            console.warn(`No data found for server ID: ${req.params.id}`);
            return res.status(404).send([]);
        }

        res.send(serverData);
    });
});

/**
 * @route GET /api/server_data
 * @desc Retrieve a list of all available server IDs
 */
router.get('/server_data', (req, res) => {
    getAllServers((err, servers) => {
        if (err) {
            console.error("Error fetching server list:", err);
            return res.status(500).send({ error: 'Failed to fetch server list' });
        }

        res.send(servers);
    });
});

module.exports = router;
