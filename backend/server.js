const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 16001;

app.use(cors());
app.use(express.json());

app.use('/api', routes); // Ensure routes are prefixed with /api

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
