// Node.js server that reads from a CSV file and serves the data as a JSON object using Express.js

const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors'); // Import the cors module

const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware to enable CORS

let locations = [];

fs.createReadStream('../WebscrapLocationData/cleaned_chipotle_locations_v2.csv')
  .pipe(csvParser())
  .on('data', (row) => {
    locations.push(row);
  });

app.get('/api/chipotle-locations', (req, res) => {
  res.json(locations);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});